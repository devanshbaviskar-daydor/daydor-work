import type * as React from 'react';

export type IconName =
  | 'check' | 'clock' | 'x' | 'alert' | 'info' | 'refresh' | 'dot' | 'chevronDown' | 'chevronRight' | 'loader'
  | 'arrowUp' | 'paperclip' | 'lock' | 'eye' | 'shield' | 'file' | 'scale' | 'database' | 'calendar' | 'undo' | 'userPlus'
  | 'home' | 'users' | 'rupee' | 'landmark' | 'folder' | 'settings' | 'search' | 'message' | 'more' | 'pause' | 'enter' | 'inbox' | 'merge'
  | 'camera' | 'receipt' | 'briefcase' | 'heart' | 'pencil' | 'sparkle' | 'user' | 'smartphone';
export type WriteLevel = 'read' | 'guarded' | 'irreversible';

/* ---------- Conversation ---------- */
export interface MessageProps {
  from?: 'daydor' | 'user';
  /** Domain orchestrator that did the work, e.g. "Payroll". Daydor messages only. */
  domain?: string;
  time?: string;
  streaming?: boolean;
  children?: React.ReactNode;
}
export declare function Message(props: MessageProps): React.ReactElement;

export interface ComposerProps {
  onSend?: (text: string) => void;
  value?: string;
  defaultValue?: string;
  onChange?: (text: string) => void;
  placeholder?: string;
  scope?: React.ReactNode;
  suggestions?: string[];
  busy?: boolean;
  footnote?: React.ReactNode;
}
export declare function Composer(props: ComposerProps): React.ReactElement;

export interface ThinkingProps { label?: React.ReactNode; steps?: React.ReactNode[] }
export declare function Thinking(props: ThinkingProps): React.ReactElement;

export interface ReceiptStep {
  kind?: 'read' | 'write' | 'gate' | 'done';
  text: React.ReactNode;
  domain?: string;
  /** Worker agent id, shown in code style. */
  worker?: string;
  time?: string;
}
export interface ReceiptProps {
  steps: ReceiptStep[];
  label?: React.ReactNode;
  duration?: string;
  writeClass?: WriteLevel;
  sources?: SourceChipProps[];
  auditId?: string;
  defaultOpen?: boolean;
}
export declare function Receipt(props: ReceiptProps): React.ReactElement;

export interface AvatarProps { kind?: 'daydor' | 'person'; name?: string; size?: number; live?: boolean }
export declare function Avatar(props: AvatarProps): React.ReactElement;

/* ---------- Decisions & runs ---------- */
export interface DecisionFigure { label: React.ReactNode; value: number | React.ReactNode; note?: React.ReactNode }
export interface DecisionCardProps {
  title: React.ReactNode;
  domain?: string;
  gate?: string;
  writeClass?: WriteLevel;
  summary?: React.ReactNode;
  figures?: DecisionFigure[];
  why?: React.ReactNode;
  deadline?: DeadlineProps;
  approveLabel?: string;
  reviewLabel?: string;
  onApprove?: () => void;
  onReview?: () => void;
  onDelegate?: (() => void) | false;
  children?: React.ReactNode;
  /** Rail row variant. */
  compact?: boolean;
  selected?: boolean;
  onOpen?: () => void;
  /** Resolved record variant. */
  state?: 'open' | 'approved' | 'declined' | 'delegated';
  resolvedNote?: React.ReactNode;
  /** Shown in danger above the title when a decision is stuck. */
  escalation?: React.ReactNode;
  /** 'routine' for 24–48h gates (leave, expenses): quiet styling, `note` instead of a deadline. */
  pace?: 'urgent' | 'routine';
  note?: React.ReactNode;
}
export declare function DecisionCard(props: DecisionCardProps): React.ReactElement;

export interface RunRowProps {
  title: React.ReactNode;
  state?: 'running' | 'waiting' | 'done' | 'failed';
  domain?: string;
  meta?: string;
  progress?: number;
}
export declare function RunRow(props: RunRowProps): React.ReactElement;

export interface BriefStat { value: React.ReactNode; label: React.ReactNode; tone?: 'warning' | 'brand' }
export interface BriefProps { greeting: React.ReactNode; date?: React.ReactNode; summary?: React.ReactNode; stats?: BriefStat[]; children?: React.ReactNode }
export declare function Brief(props: BriefProps): React.ReactElement;

/* ---------- Trust signals ---------- */
export interface WriteClassProps { level?: WriteLevel; iconOnly?: boolean; className?: string }
export declare function WriteClass(props: WriteClassProps): React.ReactElement;

export interface DeadlineProps { daysLeft?: number; date?: string; className?: string }
export declare function Deadline(props: DeadlineProps): React.ReactElement;

export interface SourceChipProps { label: React.ReactNode; kind?: 'doc' | 'law' | 'data'; href?: string; className?: string }
export declare function SourceChip(props: SourceChipProps): React.ReactElement;

/* ---------- Domain views ---------- */
export interface PageHeaderProps { title: React.ReactNode; eyebrow?: string | string[]; status?: Status; description?: React.ReactNode; actions?: React.ReactNode; tabs?: TabsItem[]; person?: string }
export declare function PageHeader(props: PageHeaderProps): React.ReactElement;
export type TabsItem = string | { label: string; active?: boolean; count?: number; onClick?: () => void };
export declare function Tabs(props: { items: TabsItem[] }): React.ReactElement;
export interface Step { label: React.ReactNode; state?: 'done' | 'current' | 'waiting' | 'blocked' | 'upcoming'; meta?: React.ReactNode; writeClass?: WriteLevel; children?: React.ReactNode }
export declare function Stepper(props: { steps: Step[]; orientation?: 'horizontal' | 'vertical' }): React.ReactElement;
export interface Stat { label: React.ReactNode; value: number | React.ReactNode; delta?: React.ReactNode; deltaTone?: 'warning' | 'success' }
export declare function StatRow(props: { items: Stat[] }): React.ReactElement;
export interface ObligationRowProps { date: string; title: React.ReactNode; authority?: string; period?: string; note?: string; amount?: number; status?: Status }
export declare function ObligationRow(props: ObligationRowProps): React.ReactElement;
export interface TimelineItem { text: React.ReactNode; by?: 'daydor' | 'person'; name?: string; domain?: string; time?: string; writeClass?: WriteLevel }
export declare function Timeline(props: { items: TimelineItem[] }): React.ReactElement;
export interface Fact { label: React.ReactNode; value: number | React.ReactNode; mono?: boolean; locked?: boolean }
export declare function FactList(props: { items: Fact[]; columns?: 1 | 2 }): React.ReactElement;

/* ---------- Documents ---------- */
export interface DocumentPageProps { company: string; title: React.ReactNode; children?: React.ReactNode; address?: string; meta?: React.ReactNode; footer?: React.ReactNode; logo?: React.ReactNode; theme?: string }
export declare function DocumentPage(props: DocumentPageProps): React.ReactElement;
export interface PayslipProps {
  company: string; address?: string; period: string; logo?: React.ReactNode; theme?: string;
  employee: { name: string; id?: string; role?: string; joined?: string; pan?: string; uan?: string; bank?: string; paidDays?: string };
  earnings: [string, number][]; deductions: [string, number][]; employer?: [string, number][]; net?: number;
}
export declare function Payslip(props: PayslipProps): React.ReactElement;
/** Indian-system words: "Rupees One Lakh Eight Thousand Four Hundred Fifty Only". */
export declare function amountInWords(value: number): string;

/* ---------- Hiring, leave, expenses, benefits, self-service ---------- */
export interface CandidateCardProps { name: string; meta?: React.ReactNode; signal?: Status; signalNote?: React.ReactNode; blocker?: { kind: 'you' | 'external' | 'agent' | 'done'; text: React.ReactNode }; selected?: boolean; onOpen?: () => void }
export declare function CandidateCard(props: CandidateCardProps): React.ReactElement;
export interface StageBoardProps { stages: { key: string; label: string; count?: number; empty?: React.ReactNode }[]; items: (CandidateCardProps & { stage: string; id?: string })[] }
export declare function StageBoard(props: StageBoardProps): React.ReactElement;
export interface VerifyCodeProps { title?: React.ReactNode; destination?: string; summary?: React.ReactNode; length?: number; value?: string; defaultValue?: string; onChange?: (code: string) => void; onComplete?: (code: string) => void; error?: React.ReactNode; resendIn?: string; onResend?: () => void; footer?: React.ReactNode }
export declare function VerifyCode(props: VerifyCodeProps): React.ReactElement;
export interface ExtractedField { label: React.ReactNode; value: number | React.ReactNode; confidence?: 'high' | 'low'; flag?: string; confirmed?: boolean }
export interface ReceiptReviewProps { fields: ExtractedField[]; src?: string; alt?: string; photo?: React.ReactNode; caption?: React.ReactNode; heading?: React.ReactNode; layout?: 'side' | 'stacked'; children?: React.ReactNode }
export declare function ReceiptReview(props: ReceiptReviewProps): React.ReactElement;
export interface AttendanceGridProps { days: { label: string; sub?: string; today?: boolean }[]; people: { name: string; /** One letter per day: P A H L O - */ marks: string }[]; legend?: boolean }
export declare function AttendanceGrid(props: AttendanceGridProps): React.ReactElement;
export interface ChoiceCardProps { title: React.ReactNode; selected?: boolean; onToggle?: (checked: boolean) => void; description?: React.ReactNode; icon?: IconName; meta?: React.ReactNode; children?: React.ReactNode }
export declare function ChoiceCard(props: ChoiceCardProps): React.ReactElement;
export interface ProfileFieldProps { label: React.ReactNode; value: React.ReactNode; tier?: 'direct' | 'review' | 'gated'; pending?: React.ReactNode; onEdit?: () => void; actionLabel?: string }
export declare function ProfileField(props: ProfileFieldProps): React.ReactElement;

/* ---------- Navigation ---------- */
export interface NavItem { key?: string; label: string; icon: IconName; href?: string; active?: boolean; count?: number; countTone?: 'warning'; onClick?: () => void }
export interface SidebarProps { items: NavItem[]; workspace?: string; user?: { name: string; role?: string }; onAsk?: () => void; footerItems?: NavItem[] }
export declare function Sidebar(props: SidebarProps): React.ReactElement;

export interface CommandItem { icon?: IconName; label: string; hint?: string; writeClass?: WriteLevel; ask?: boolean }
export interface CommandBarProps { groups: { label: string; items: CommandItem[] }[]; onSelect?: (item: CommandItem) => void; onClose?: () => void; defaultQuery?: string; inline?: boolean }
export declare function CommandBar(props: CommandBarProps): React.ReactElement;

export interface TabItem { key?: string; label: string; icon: IconName; href?: string; active?: boolean; count?: number; primary?: boolean }
export declare function TabBar(props: { items: TabItem[] }): React.ReactElement;
export declare function Kbd(props: { children?: React.ReactNode }): React.ReactElement;

/* ---------- System states ---------- */
export interface BannerProps { title: React.ReactNode; children?: React.ReactNode; tone?: 'paused' | 'warning' | 'danger' | 'info'; action?: { label: string; onClick?: () => void }; icon?: IconName }
export declare function Banner(props: BannerProps): React.ReactElement;

export interface CalloutProps { title: React.ReactNode; children?: React.ReactNode; tone?: 'danger' | 'warning' | 'info' | 'neutral'; eyebrow?: string | string[]; actions?: React.ReactNode; icon?: IconName }
export declare function Callout(props: CalloutProps): React.ReactElement;

export interface EmptyStateProps { title: React.ReactNode; children?: React.ReactNode; icon?: IconName; action?: React.ReactNode; size?: 'md' | 'sm' }
export declare function EmptyState(props: EmptyStateProps): React.ReactElement;

/* ---------- Primitives ---------- */
export type Status = 'needs-you' | 'running' | 'done' | 'failed' | 'pending' | 'upcoming' | 'shortlist' | 'hold' | 'awaiting-consent' | 'in-review' | 'manager-review' | 'approved' | 'rejected' | 'withdrawn' | 'draft' | 'processing' | 'paid' | 'overdue' | 'filed';
export interface BadgeProps { status?: Status; tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'brand'; icon?: IconName | false; children?: React.ReactNode; className?: string }
export declare function Badge(props: BadgeProps): React.ReactElement;

export interface AmountProps { /** Rupees, not paise. */ value: number; compact?: boolean; paise?: boolean; size?: 'md' | 'lg'; tone?: 'muted' | 'danger' | 'success'; className?: string }
export declare function Amount(props: AmountProps): React.ReactElement;
export declare function formatINR(value: number, opts?: { compact?: boolean; paise?: boolean }): string;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: IconName;
  iconRight?: IconName;
  loading?: boolean;
  fullWidth?: boolean;
}
export declare function Button(props: ButtonProps): React.ReactElement;

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label: React.ReactNode; hint?: React.ReactNode; error?: React.ReactNode; prefix?: React.ReactNode; suffix?: React.ReactNode; optional?: boolean;
}
export declare function Input(props: InputProps): React.ReactElement;

export interface SelectOption { value: string; label: string; disabled?: boolean }
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: React.ReactNode; options: Array<string | SelectOption>; placeholder?: string; hint?: React.ReactNode; error?: React.ReactNode; optional?: boolean;
}
export declare function Select(props: SelectProps): React.ReactElement;

export interface TableColumn<Row> { key: string; header: React.ReactNode; numeric?: boolean; align?: 'left' | 'right'; width?: number | string; render?: (row: Row) => React.ReactNode }
export interface TableProps<Row> { columns: TableColumn<Row>[]; rows: Row[]; rowKey?: (row: Row, index: number) => React.Key; caption?: string; density?: 'comfortable' | 'compact'; empty?: React.ReactNode; className?: string }
export declare function Table<Row>(props: TableProps<Row>): React.ReactElement;

export interface DialogProps {
  title: React.ReactNode; description?: React.ReactNode; children?: React.ReactNode; footer?: React.ReactNode;
  open?: boolean; onClose?: () => void; size?: 'md' | 'lg';
  /** One sentence on what cannot be undone; renders the lock strip and role="alertdialog". */
  irreversible?: React.ReactNode;
  inline?: boolean;
}
export declare function Dialog(props: DialogProps): React.ReactElement | null;

export declare function Icon(props: { name: IconName; size?: number; strokeWidth?: number; className?: string }): React.ReactElement;

declare global {
  interface Window {
    Daydor: {
      Message: typeof Message; Composer: typeof Composer; Thinking: typeof Thinking; Receipt: typeof Receipt;
      DecisionCard: typeof DecisionCard; RunRow: typeof RunRow; Brief: typeof Brief; Avatar: typeof Avatar;
      WriteClass: typeof WriteClass; Deadline: typeof Deadline; SourceChip: typeof SourceChip;
      Badge: typeof Badge; Amount: typeof Amount; formatINR: typeof formatINR; Button: typeof Button;
      Input: typeof Input; Select: typeof Select; Table: typeof Table; Dialog: typeof Dialog; Icon: typeof Icon;
      Sidebar: typeof Sidebar; CommandBar: typeof CommandBar; TabBar: typeof TabBar; Kbd: typeof Kbd;
      Banner: typeof Banner; Callout: typeof Callout; EmptyState: typeof EmptyState;
      PageHeader: typeof PageHeader; Tabs: typeof Tabs; Stepper: typeof Stepper; StatRow: typeof StatRow;
      ObligationRow: typeof ObligationRow; Timeline: typeof Timeline; FactList: typeof FactList;
      DocumentPage: typeof DocumentPage; Payslip: typeof Payslip; amountInWords: typeof amountInWords;
      StageBoard: typeof StageBoard; CandidateCard: typeof CandidateCard; VerifyCode: typeof VerifyCode; ReceiptReview: typeof ReceiptReview;
      AttendanceGrid: typeof AttendanceGrid; ChoiceCard: typeof ChoiceCard; ProfileField: typeof ProfileField;
    };
  }
}
