import User from "@/app/models/User";
import { connectMongo } from "@/utilities/connection";
import { notFound } from "next/navigation";
import HomeHeader from "@/components/HomeHeader";
import RoutineCardSection from "@/components/RoutineCardSection";
import ProfileLogs from "@/components/ProfileLogs";

const UserProfilePage = async ({params}: {params: Promise<{userId: string}>}) => {
  const userId = (await params).userId;

  await connectMongo();
  let user;
  try{
    user = await User.findById(userId);
    if(!user) return <div>User not found</div>;
  } catch (error) {
    console.error("Error fetching user:", error);
    return notFound();
  }
  return (
    <>
      <HomeHeader name={user.name} createdAt={user.createdAt} />
      <RoutineCardSection userId={userId} />
      <ProfileLogs userId={userId} />
    </>
  )
}

export default UserProfilePage