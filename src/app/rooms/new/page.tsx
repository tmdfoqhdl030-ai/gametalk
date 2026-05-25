import CreateRoomForm from "@/components/rooms/CreateRoomForm";

export default function NewRoomPage() {
  return (
    <div className="max-w-xl mx-auto px-6 py-10">
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-gray-900">방 만들기</h1>
        <p className="text-sm text-gray-400 mt-1">영어로 소통하며 함께 게임할 팀원을 모집하세요</p>
      </div>
      <CreateRoomForm />
    </div>
  );
}
