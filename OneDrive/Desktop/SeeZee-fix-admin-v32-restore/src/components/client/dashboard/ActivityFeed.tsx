"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import FileUploadActivity from "./activity/FileUploadActivity";
import MessageActivity from "./activity/MessageActivity";
import MilestoneActivity from "./activity/MilestoneActivity";
import PaymentActivity from "./activity/PaymentActivity";
import TaskCompletedActivity from "./activity/TaskCompletedActivity";
import type { Activity } from "@/lib/dashboard-helpers";

interface ActivityFeedProps {
  activities: Activity[];
  projectId: string;
}

export default function ActivityFeed({ activities, projectId }: ActivityFeedProps) {
  const [filter, setFilter] = useState<'all' | 'files' | 'ai' | 'team'>('all');
  const [displayCount, setDisplayCount] = useState(10);
  
  const filteredActivities = activities.filter((activity) => {
    if (filter === 'all') return true;
    if (filter === 'files') return activity.type === 'FILE_UPLOAD';
    if (filter === 'team') return ['MESSAGE', 'MILESTONE', 'TASK_COMPLETED'].includes(activity.type);
    return false;
  }).slice(0, displayCount);
  
  if (activities.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl border border-gray-800 bg-gray-900/50 p-12 text-center"
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-800 text-4xl">
          📰
        </div>
        <h3 className="mb-2 font-heading text-xl font-bold text-white">
          Activity will appear here
        </h3>
        <p className="text-gray-400">
          As your project progresses, you'll see updates about files, messages, milestones, and more.
        </p>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-xl border border-gray-800 bg-gray-900/50 p-6"
    >
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📰</span>
          <h2 className="font-heading text-xl font-bold text-white">
            Activity & Updates
          </h2>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`rounded-lg px-3 py-1 text-sm font-medium transition-all ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('files')}
            className={`rounded-lg px-3 py-1 text-sm font-medium transition-all ${
              filter === 'files'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            Files
          </button>
          <button
            onClick={() => setFilter('team')}
            className={`rounded-lg px-3 py-1 text-sm font-medium transition-all ${
              filter === 'team'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            Team
          </button>
        </div>
      </div>
      
      {/* Activity List */}
      <div className="space-y-6">
        {filteredActivities.map((activity, index) => {
          // Group by date
          const currentDate = new Date(activity.createdAt).toLocaleDateString();
          const previousDate = index > 0 
            ? new Date(filteredActivities[index - 1].createdAt).toLocaleDateString()
            : null;
          const showDateHeader = currentDate !== previousDate;
          
          return (
            <div key={activity.id}>
              {showDateHeader && (
                <div className="mb-4 mt-6 first:mt-0">
                  <h3 className="text-sm font-semibold text-gray-400">
                    {currentDate === new Date().toLocaleDateString() 
                      ? 'Today'
                      : currentDate === new Date(Date.now() - 86400000).toLocaleDateString()
                      ? 'Yesterday'
                      : currentDate
                    }
                  </h3>
                </div>
              )}
              
              <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-4">
                {activity.type === 'FILE_UPLOAD' && <FileUploadActivity activity={activity} />}
                {activity.type === 'MESSAGE' && <MessageActivity activity={activity} />}
                {activity.type === 'MILESTONE' && <MilestoneActivity activity={activity} />}
                {activity.type === 'PAYMENT' && <PaymentActivity activity={activity} />}
                {activity.type === 'TASK_COMPLETED' && <TaskCompletedActivity activity={activity} />}
                {activity.type === 'PROJECT_CREATED' && (
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-xl">
                      🚀
                    </div>
                    <div className="flex-1">
                      <p className="text-white">
                        <span className="font-semibold">{activity.title}</span>
                      </p>
                      <p className="mt-1 text-sm text-gray-400">{activity.description}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {new Date(activity.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Load More */}
      {filteredActivities.length < activities.length && (
        <button
          onClick={() => setDisplayCount(prev => prev + 10)}
          className="mt-6 w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2 text-sm font-medium text-white transition-all hover:border-gray-600 hover:bg-gray-800"
        >
          Load More
        </button>
      )}
    </motion.div>
  );
}

