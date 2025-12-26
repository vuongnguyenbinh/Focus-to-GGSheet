/**
 * Analytics Panel - Beautiful statistics dashboard
 */

import { useState, useEffect } from 'react'
import {
  CheckCircle2,
  ListTodo,
  Bookmark,
  FileText,
  TrendingUp,
  Clock,
  Calendar,
  FolderOpen,
  Tags,
  Briefcase,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getAllItems } from '@/db/operations/item-operations'
import { getAllCategories } from '@/db/operations/category-operations'
import { getAllProjects } from '@/db/operations/project-operations'
import { getAllTags } from '@/db/operations/tag-operations'
import type { Item, Category, Project, Tag } from '@/types'

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: number | string
  subValue?: string
  color: string
  delay?: number
}

function StatCard({ icon, label, value, subValue, color, delay = 0 }: StatCardProps) {
  return (
    <div
      className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-1.5 rounded-lg ${color}`}>
          {icon}
        </div>
        <span className="text-xs text-[var(--text-secondary)] font-medium">{label}</span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-bold">{value}</span>
        {subValue && (
          <span className="text-xs text-[var(--text-secondary)]">{subValue}</span>
        )}
      </div>
    </div>
  )
}

interface ProgressBarProps {
  label: string
  value: number
  max: number
  color: string
}

function ProgressBar({ label, value, max, color }: ProgressBarProps) {
  const percent = max > 0 ? Math.round((value / max) * 100) : 0

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-[var(--text-secondary)]">{label}</span>
        <span className="font-medium">{value}/{max}</span>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

export function AnalyticsPanel() {
  const { t, i18n } = useTranslation()
  const [items, setItems] = useState<Item[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [itemsData, categoriesData, projectsData, tagsData] = await Promise.all([
        getAllItems(),
        getAllCategories(),
        getAllProjects(),
        getAllTags(),
      ])
      setItems(itemsData)
      setCategories(categoriesData)
      setProjects(projectsData)
      setTags(tagsData)
    } catch (error) {
      console.error('Failed to load analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate stats
  const tasks = items.filter((i) => i.type === 'task')
  const completedTasks = tasks.filter((t) => t.completed)
  const bookmarks = items.filter((i) => i.type === 'bookmark')
  const notes = items.filter((i) => i.type === 'note')

  // Recent activity (last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const recentItems = items.filter((i) => new Date(i.createdAt) > sevenDaysAgo)

  // Task completion rate
  const completionRate = tasks.length > 0
    ? Math.round((completedTasks.length / tasks.length) * 100)
    : 0

  // Today's tasks
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todaysTasks = tasks.filter((t) => {
    const taskDate = new Date(t.createdAt)
    taskDate.setHours(0, 0, 0, 0)
    return taskDate.getTime() === today.getTime()
  })

  // Priority breakdown
  const highPriority = tasks.filter((t) => t.priority === 'high' && !t.completed)
  const mediumPriority = tasks.filter((t) => t.priority === 'medium' && !t.completed)
  const lowPriority = tasks.filter((t) => t.priority === 'low' && !t.completed)

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center h-full">
        <div className="animate-pulse-soft text-[var(--text-secondary)]">
          {t('common.loading')}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-brand" />
          {t('analytics.title')}
        </h2>
        <span className="text-xs text-[var(--text-secondary)]">
          {t('analytics.updated')}: {new Date().toLocaleTimeString(i18n.language === 'vi' ? 'vi-VN' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<ListTodo className="w-4 h-4 text-white" />}
          label={t('analytics.tasks')}
          value={tasks.length}
          subValue={t('analytics.completedCount', { count: completedTasks.length })}
          color="bg-blue-500"
          delay={0}
        />
        <StatCard
          icon={<Bookmark className="w-4 h-4 text-white" />}
          label={t('analytics.bookmarks')}
          value={bookmarks.length}
          color="bg-purple-500"
          delay={50}
        />
        <StatCard
          icon={<FileText className="w-4 h-4 text-white" />}
          label={t('analytics.notes')}
          value={notes.length}
          color="bg-green-500"
          delay={100}
        />
        <StatCard
          icon={<CheckCircle2 className="w-4 h-4 text-white" />}
          label={t('analytics.completionRate')}
          value={`${completionRate}%`}
          color="bg-brand"
          delay={150}
        />
      </div>

      {/* Task Progress */}
      <section className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-brand" />
          {t('analytics.taskProgress')}
        </h3>
        <ProgressBar
          label={t('analytics.completed')}
          value={completedTasks.length}
          max={tasks.length}
          color="bg-brand"
        />
      </section>

      {/* Priority Breakdown */}
      {(highPriority.length > 0 || mediumPriority.length > 0 || lowPriority.length > 0) && (
        <section className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
          <h3 className="text-sm font-semibold mb-3">{t('analytics.byPriority')}</h3>
          <div className="space-y-2">
            {highPriority.length > 0 && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span>{t('tasks.priorityHigh')}</span>
                </div>
                <span className="font-medium text-red-500">{highPriority.length}</span>
              </div>
            )}
            {mediumPriority.length > 0 && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-500" />
                  <span>{t('tasks.priorityMedium')}</span>
                </div>
                <span className="font-medium text-yellow-600">{mediumPriority.length}</span>
              </div>
            )}
            {lowPriority.length > 0 && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span>{t('tasks.priorityLow')}</span>
                </div>
                <span className="font-medium text-green-600">{lowPriority.length}</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Activity Overview */}
      <section className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-brand" />
          {t('analytics.activity')}
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--text-secondary)]">{t('analytics.today')}</span>
            <span className="font-medium">{t('analytics.tasksCount', { count: todaysTasks.length })}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--text-secondary)]">{t('analytics.last7Days')}</span>
            <span className="font-medium">{t('analytics.newItemsCount', { count: recentItems.length })}</span>
          </div>
        </div>
      </section>

      {/* Metadata Summary */}
      <section className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
        <h3 className="text-sm font-semibold mb-3">{t('analytics.organization')}</h3>
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 rounded-lg bg-[var(--bg-primary)]">
            <FolderOpen className="w-4 h-4 mx-auto mb-1 text-[var(--text-secondary)]" />
            <span className="text-lg font-bold">{categories.length}</span>
            <p className="text-[10px] text-[var(--text-secondary)]">{t('analytics.categories')}</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-[var(--bg-primary)]">
            <Briefcase className="w-4 h-4 mx-auto mb-1 text-[var(--text-secondary)]" />
            <span className="text-lg font-bold">{projects.length}</span>
            <p className="text-[10px] text-[var(--text-secondary)]">{t('analytics.projects')}</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-[var(--bg-primary)]">
            <Tags className="w-4 h-4 mx-auto mb-1 text-[var(--text-secondary)]" />
            <span className="text-lg font-bold">{tags.length}</span>
            <p className="text-[10px] text-[var(--text-secondary)]">{t('analytics.tags')}</p>
          </div>
        </div>
      </section>

      {/* Total Summary */}
      <div className="text-center text-xs text-[var(--text-secondary)] pt-2 border-t border-[var(--border-color)]">
        {t('analytics.total')}: <span className="font-semibold">{items.length}</span> {t('analytics.items')}
      </div>
    </div>
  )
}
