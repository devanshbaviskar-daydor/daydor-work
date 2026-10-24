import type { LucideIcon } from 'lucide-react'
import {
  AlertTriangle,
  ArrowUp,
  Briefcase,
  Calendar,
  Camera,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Database,
  Eye,
  File,
  Folder,
  Heart,
  Home,
  Inbox,
  Landmark,
  Loader2,
  Lock,
  Merge,
  MessageSquare,
  MoreHorizontal,
  Paperclip,
  Pause,
  Receipt,
  RefreshCw,
  Scale,
  Search,
  Settings,
  Shield,
  Undo2,
  User,
  UserPlus,
  Users,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export type IconName =
  | 'check'
  | 'clock'
  | 'x'
  | 'alert'
  | 'info'
  | 'refresh'
  | 'dot'
  | 'chevronDown'
  | 'chevronRight'
  | 'loader'
  | 'arrowUp'
  | 'paperclip'
  | 'lock'
  | 'eye'
  | 'shield'
  | 'file'
  | 'scale'
  | 'database'
  | 'calendar'
  | 'undo'
  | 'userPlus'
  | 'home'
  | 'users'
  | 'rupee'
  | 'landmark'
  | 'folder'
  | 'settings'
  | 'search'
  | 'message'
  | 'more'
  | 'pause'
  | 'enter'
  | 'inbox'
  | 'merge'
  | 'briefcase'
  | 'receipt'
  | 'camera'
  | 'heart'
  | 'user'

const ICONS: Record<IconName, LucideIcon> = {
  check: Check,
  clock: Clock,
  x: X,
  alert: AlertTriangle,
  info: AlertTriangle,
  refresh: RefreshCw,
  dot: Check,
  chevronDown: ChevronDown,
  chevronRight: ChevronRight,
  loader: Loader2,
  arrowUp: ArrowUp,
  paperclip: Paperclip,
  lock: Lock,
  eye: Eye,
  shield: Shield,
  file: File,
  scale: Scale,
  database: Database,
  calendar: Calendar,
  undo: Undo2,
  userPlus: UserPlus,
  home: Home,
  users: Users,
  rupee: Landmark,
  landmark: Landmark,
  folder: Folder,
  settings: Settings,
  search: Search,
  message: MessageSquare,
  more: MoreHorizontal,
  pause: Pause,
  enter: ArrowUp,
  inbox: Inbox,
  merge: Merge,
  briefcase: Briefcase,
  receipt: Receipt,
  camera: Camera,
  heart: Heart,
  user: User,
}

export interface DaydorIconProps {
  name: IconName
  size?: number
  strokeWidth?: number
  className?: string
}

export function Icon({ name, size = 16, strokeWidth, className }: DaydorIconProps) {
  const Cmp = ICONS[name]
  const resolvedStroke = strokeWidth ?? (size <= 13 ? 2 : 1.75)
  return (
    <Cmp
      size={size}
      strokeWidth={resolvedStroke}
      className={cn('shrink-0', className)}
      aria-hidden="true"
    />
  )
}
