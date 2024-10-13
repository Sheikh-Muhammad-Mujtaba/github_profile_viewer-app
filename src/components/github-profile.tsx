"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import {
  ExternalLinkIcon,
  ForkliftIcon,
  LocateIcon,
  RecycleIcon,
  StarIcon,
  UsersIcon,
} from "lucide-react";
import ClipLoader from "react-spinners/ClipLoader";
import { Bar } from "react-chartjs-2";
import { Chart, BarElement, Tooltip, Legend, CategoryScale, LinearScale } from "chart.js";
Chart.register(BarElement, Tooltip, Legend, CategoryScale, LinearScale);

type UserProfile = {
  login: string;
  avatar_url: string;
  html_url: string;
  bio: string;
  followers: number;
  following: number;
  location: string;
};

type UserRepo = {
  id: number;
  name: string;
  html_url: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
};

export default function GitHubProfileViewer() {
  const [username, setUsername] = useState<string>("");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userRepos, setUserRepos] = useState<UserRepo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const profileResponse = await fetch(`https://api.github.com/users/${username}`);
      if (!profileResponse.ok) {
        throw new Error("User not found");
      }
      const profileData = await profileResponse.json();
      const reposResponse = await fetch(`https://api.github.com/users/${username}/repos`);
      if (!reposResponse.ok) {
        throw new Error("Repositories not found");
      }
      const reposData = await reposResponse.json();
      setUserProfile(profileData);
      setUserRepos(reposData);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const languageStats = userRepos.reduce((acc, repo) => {
    if (repo.language) {
      acc[repo.language] = (acc[repo.language] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const totalRepos = userRepos.length;
  const languageLabels = Object.keys(languageStats);
  const languageData = Object.values(languageStats).map((count) => (count / totalRepos) * 100);

  const chartData = {
    labels: languageLabels,
    datasets: [
      {
        label: "Languages (%)",
        data: languageData,
        backgroundColor: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#6366F1"],
      },
    ],
  };

  const chartOptions = {
    plugins: {
        legend: {
            onClick: undefined, 
        },
    },
};


  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    fetchUserData();
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 py-8">
      <Card className="w-full max-w-3xl p-6 space-y-4 shadow-lg transition-shadow duration-300 rounded-lg bg-white border">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold mb-2">GitHub Profile Viewer</CardTitle>
          <CardDescription className="text-gray-600">
            Search for a GitHub username and view their profile, repositories, and activity.
            <br />
            search like: Sheikh-Muhammad-Mujtaba, AsharibAli, codecrafters-io
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} className="mb-8 px-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Input
              type="text"
              placeholder="Enter a GitHub username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="flex-1 border rounded-md p-2"
            />
            <Button type="submit" disabled={loading} className="px-4 py-2 bg-black text-white rounded-md">
              {loading ? <ClipLoader className="w-4 h-4 text-white" /> : "Search"}
            </Button>
          </div>
        </form>
        {error && <p className="text-red-500 text-center">{error}</p>}
        {userProfile && (
          <div className="grid gap-8 px-6">
            <div className="grid md:grid-cols-[120px_1fr] gap-6">
              <Avatar className="w-24 h-24 sm:w-30 sm:h-30 border-2 border-blue-500 shadow-lg rounded-full">
                <AvatarImage src={userProfile.avatar_url} />
                <AvatarFallback>{userProfile.login.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="grid gap-2">
                <div className="flex items-center gap-2 ">
                  <h2 className="text-2xl font-bold">{userProfile.login}</h2>
                  <Link href={userProfile.html_url} target="_blank" className="text-black">
                    <ExternalLinkIcon className="w-5 h-5" />
                  </Link>
                </div>
                <p className="text-gray-600 break-words">{userProfile.bio}</p>
                <div className="flex flex-col sm:flex-row items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <UsersIcon className="w-4 h-4" />
                    <span>{userProfile.followers} Followers</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <UsersIcon className="w-4 h-4" />
                    <span>{userProfile.following} Following</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <LocateIcon className="w-4 h-4" />
                    <span>{userProfile.location || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Bar Chart with Percentage Language Distribution */}
            <div className="bg-gray-50 rounded-lg p-4 overflow-hidden">
              <h3 className="text-xl font-bold mb-4">Language Breakdown</h3>
              <Bar data={chartData} options={chartOptions} />
            </div>
            <div className="grid gap-6">
              <h3 className="text-xl font-bold">Repositories</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-6">
                {userRepos.map((repo) => (
                  <Card key={repo.id} className="shadow-md rounded-lg bg-white border hover:shadow-lg overflow-hidden">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <RecycleIcon className="w-6 h-6" />
                        <CardTitle>
                          <Link href={repo.html_url} target="_blank" className="hover:text-black break-words">
                            {repo.name}
                          </Link>
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 break-words">{repo.description || "No description"}</p>
                    </CardContent>
                    <CardFooter className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <StarIcon className="w-4 h-4" />
                        <span>{repo.stargazers_count}</span>
                        <ForkliftIcon className="w-4 h-4" />
                        <span>{repo.forks_count}</span>
                      </div>
                      <Link href={repo.html_url} target="_blank" className="text-black hover:underline">
                        View on GitHub
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}