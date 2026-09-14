import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRightIcon, SearchIcon, UsersIcon } from "lucide-react";
import { Link } from "react-router";
import { getUserFriends } from "../lib/api";
import FriendCard from "../components/FriendCard";
import NoFriendsFound from "../components/NoFriendsFound";

const FriendsPage = () => {
  const [search, setSearch] = useState("");

  const { data: friends = [], isLoading } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const normalizedSearch = search.trim().toLowerCase();
  const filteredFriends = friends.filter((friend) => {
    if (!normalizedSearch) return true;

    return [friend.fullname, friend.nativeLanguage, friend.learningLanguage]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(normalizedSearch));
  });

  return (
    <div className="min-h-full px-4 py-5 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="studio-hero relative isolate overflow-hidden px-5 py-7 sm:px-8 sm:py-9 lg:px-10">
          <div className="studio-glow-primary pointer-events-none absolute -right-16 -top-20 -z-10 size-56 rounded-full blur-3xl" />
          <div className="flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <div className="studio-kicker mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em]">
                <UsersIcon className="size-4" />
                Your language circle
              </div>
              <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                Friends who keep you learning.
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-base-content/70 sm:text-base">
                Find a conversation partner and turn practice into a habit.
              </p>
            </div>
            <div className="rounded-lg border border-neutral-content/15 bg-neutral-content/10 px-5 py-3 backdrop-blur-sm">
              <p className="text-2xl font-bold leading-none">{friends.length}</p>
              <p className="mt-1 text-xs text-base-content/60">{friends.length === 1 ? "Friend" : "Friends"}</p>
            </div>
          </div>
        </section>

        <section className="space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <UsersIcon className="size-5 text-primary" />
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Your friends</h2>
              </div>
              <p className="mt-1 text-sm text-base-content/60">
                {filteredFriends.length} {filteredFriends.length === 1 ? "person" : "people"} match your circle.
              </p>
            </div>

            <label className="input input-bordered flex w-full items-center gap-2 bg-[#fffdf8] sm:max-w-xs">
              <SearchIcon className="size-4 text-base-content/50" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search friends"
                aria-label="Search friends"
              />
            </label>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="h-44 animate-pulse rounded-2xl bg-base-200" />
              ))}
            </div>
          ) : friends.length === 0 ? (
            <NoFriendsFound />
          ) : filteredFriends.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-base-content/20 bg-base-200/50 px-6 py-12 text-center">
              <SearchIcon className="mx-auto size-8 text-base-content/40" />
              <h3 className="mt-3 font-semibold">No friends found</h3>
              <p className="mt-1 text-sm text-base-content/60">Try a different name or language.</p>
              <button className="btn btn-ghost btn-sm mt-3" onClick={() => setSearch("")}>
                Clear search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {filteredFriends.map((friend) => (
                <FriendCard key={friend._id} friend={friend} />
              ))}
            </div>
          )}
        </section>

        <div className="studio-panel flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h3 className="font-semibold">Looking for more practice partners?</h3>
            <p className="mt-1 text-sm text-base-content/60">Discover learners who share your language goals.</p>
          </div>
          <Link to="/" className="btn btn-primary btn-sm w-full sm:w-auto">
            Discover learners
            <ArrowUpRightIcon className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FriendsPage;
