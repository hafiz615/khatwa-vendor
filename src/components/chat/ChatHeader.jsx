import { User2 } from "lucide-react";

function ChatHeader({chat}) {
  return (
    <div className="flex items-center gap-4 p-5 bg-white/80 backdrop-blur-lg border-b border-slate-200/60 sticky top-0 z-10 shadow-sm">
          <div className="relative">
            {
              chat.profile ? (
                <img
              src={chat.profile}
              alt={chat.name}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-100 shadow-md"
            />
              ):(
                <>
                  <User2 className="w-12 h-12 text-gray-400 rounded-full ring-2" />
                </>
              )
            }
            {/* <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white shadow-sm"></div> */}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-slate-800 text-base">{chat.name}</p>
            <p className="text-xs text-emerald-600 font-medium">{chat.bio}</p>
          </div>
        </div>
  )
}

export default ChatHeader
