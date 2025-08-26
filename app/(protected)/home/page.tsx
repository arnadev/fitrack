import RoutineCardSection from "@/components/RoutineCardSection";
import ProfileLogs from "@/components/ProfileLogs";
import { notFound } from "next/navigation";
import { getUserId } from "@/utilities/gerUserId";
import { cookies } from "next/headers";
import User from "@/app/models/User";
import { connectMongo } from "@/utilities/connection";
import HomeHeader from "@/components/HomeHeader";

const HomePage = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")!.value; //cannot be null in homepage due to middleware
  const userId = await getUserId(token);
  await connectMongo();
  const user = await User.findById(userId);
  if(!user){
    return notFound();
  }
  return (
    <>
      <HomeHeader name={user.name} email={user.email} createdAt={user.createdAt} />
      <RoutineCardSection userId={userId} isOwner={true} />
      <ProfileLogs userId={userId} isOwner={true} />
    </>
  );
};

export default HomePage;