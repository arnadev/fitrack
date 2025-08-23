import LogoutButton from "@/components/LogoutButton";
import RoutineCardSection from "@/components/RoutineCardSection";

import { getUserId } from "@/utilities/gerUserId";
import { cookies } from "next/headers";

const HomePage = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")!.value; //cannot be null in homepage due to middleware
  const userId = await getUserId(token);
  return (
    <>
    <RoutineCardSection userId={userId} />
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <LogoutButton />
    </div>
    </>
  );
};

export default HomePage;