import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getOutgoingFriendReqs,
  getRecommendedUsers,
  getUserFriends,
  sendFriendRequest,
} from "../lib/api";
import { Link } from "react-router";
import {
  ArrowUpRightIcon,
  CheckCircleIcon,
  MapPinIcon,
  MessageCircleIcon,
  SparklesIcon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react";

import { capitialize } from "../lib/utils";

import FriendCard from "../components/FriendCard";

import NoFriendsFound from "../components/NoFriendsFound";
import { getLanguageFlag } from "../lib/languageFlag";

const HomePage = () => {
  const queryClient = useQueryClient();

  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const { data: recommendedUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: getRecommendedUsers,
  });

  const { data: outgoingFriendReqs } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs,
  });

  const outgoingRequestsIds = new Set(
    (outgoingFriendReqs ?? [])
      .map((request) => request.recipient?._id)
      .filter(Boolean)
  );

  const { mutate: sendRequestMutation, isPending } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] }),
  });

  return (
    <div className="min-h-full bg-base-100 px-4 py-5 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-7xl space-y-8 sm:space-y-10">
        <section className="relative isolate overflow-hidden rounded-[1.75rem] border border-primary/20 bg-gradient-to-br from-primary/15 via-base-200 to-secondary/10 px-5 py-7 shadow-sm sm:px-8 sm:py-9 lg:px-10">
          <div className="pointer-events-none absolute -right-16 -top-20 -z-10 size-56 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 -z-10 size-64 rounded-full bg-secondary/10 blur-3xl" />
          <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                <SparklesIcon className="size-4" />
                Your language circle
              </div>
              <h1 className="max-w-xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                Make every conversation count.
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-base-content/70 sm:text-base">
                Keep in touch with your friends and find learners who make practicing feel natural.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3">
              <div className="rounded-2xl border border-base-content/10 bg-base-100/70 px-4 py-3 backdrop-blur-sm">
                <p className="text-2xl font-bold leading-none">{friends.length}</p>
                <p className="mt-1 text-xs text-base-content/60">Friends</p>
              </div>
              <div className="rounded-2xl border border-base-content/10 bg-base-100/70 px-4 py-3 backdrop-blur-sm">
                <p className="text-2xl font-bold leading-none">{recommendedUsers.length}</p>
                <p className="mt-1 text-xs text-base-content/60">New learners</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <UsersIcon className="size-5 text-primary" />
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Your friends</h2>
              </div>
              <p className="mt-1 text-sm text-base-content/60">Pick up where your last conversation left off.</p>
            </div>
            <Link to="/notifications" className="btn btn-outline btn-sm w-full sm:w-auto">
              <UsersIcon className="size-4" />
              Friend requests
              <ArrowUpRightIcon className="size-4" />
            </Link>
          </div>

        {loadingFriends ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-44 animate-pulse rounded-2xl bg-base-200" />
            ))}
          </div>
        ) : friends.length === 0 ? (
          <NoFriendsFound />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {friends.map((friend) => (
              <FriendCard key={friend._id} friend={friend} />
            ))}
          </div>
        )}
        </section>

        <section>
          <div className="mb-4 flex items-end justify-between gap-4 sm:mb-5">
            <div>
              <div className="flex items-center gap-2">
                <MessageCircleIcon className="size-5 text-secondary" />
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Meet new learners</h2>
              </div>
              <p className="mt-1 max-w-2xl text-sm text-base-content/60">
                Discover language partners who match the way you want to practice.
              </p>
            </div>
          </div>

          {loadingUsers ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : recommendedUsers.length === 0 ? (
            <div className="card bg-base-200 p-6 text-center">
              <h3 className="font-semibold text-lg mb-2">No recommendations available</h3>
              <p className="text-base-content opacity-70">
                Check back later for new language partners!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {recommendedUsers.map((user) => {
                const hasRequestBeenSent = outgoingRequestsIds.has(user._id);

                return (
                  <div
                    key={user._id}
                    className="group card border border-base-300/70 bg-base-200/70 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
                  >
                    <div className="card-body gap-4 p-5 sm:p-6">
                      <div className="flex items-start gap-3">
                        <div className="avatar size-16 shrink-0 rounded-2xl ring-2 ring-base-100 ring-offset-2 ring-offset-base-200">
                          <img src={user.profilePicture || user.profilePic} alt={user.fullname} />
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate text-lg font-semibold">{user.fullname}</h3>
                          {user.location && (
                            <div className="mt-1 flex items-center text-xs text-base-content/60">
                              <MapPinIcon className="mr-1 size-3 shrink-0" />
                              {user.location}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Languages with flags */}
                      <div className="flex min-h-7 flex-wrap gap-1.5">
                        <span className="badge badge-secondary max-w-full gap-1 text-xs">
                          {getLanguageFlag(user.nativeLanguage)}
                          Native: {capitialize(user.nativeLanguage)}
                        </span>
                        <span className="badge badge-outline max-w-full gap-1 text-xs">
                          {getLanguageFlag(user.learningLanguage)}
                          Learning: {capitialize(user.learningLanguage)}
                        </span>
                      </div>

                      {user.bio && <p className="line-clamp-2 min-h-10 text-sm leading-5 text-base-content/70">{user.bio}</p>}

                      {/* Action button */}
                      <button
                        className={`btn mt-1 w-full ${
                          hasRequestBeenSent ? "btn-disabled" : "btn-primary"
                        } `}
                        onClick={() => sendRequestMutation(user._id)}
                        disabled={hasRequestBeenSent || isPending}
                      >
                        {hasRequestBeenSent ? (
                          <>
                            <CheckCircleIcon className="size-4 mr-2" />
                            Request Sent
                          </>
                        ) : (
                          <>
                            <UserPlusIcon className="size-4 mr-2" />
                            Send Friend Request
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default HomePage;