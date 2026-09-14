import { VideoIcon } from "lucide-react"

function CallButton({ handleVideoCall }) {
    return (
        <div className="flex shrink-0 items-center px-3">
            <button
                onClick={handleVideoCall}
                className="btn btn-ghost btn-circle btn-sm text-success"
                aria-label="Start video call"
                title="Start video call"
            >
                <VideoIcon className="size-6" />
            </button>
        </div>
    )
}

export default CallButton;