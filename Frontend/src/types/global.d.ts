/* Report START */
type ReportUser = {
  id: string;
  name: string;
  email: string;
  avatar: string;
};

type ReportPin = {
  id: number;
  profile_id: string;
  title: string;
  description: string;
  imgurls: string;
  date: string;
  location: string;
  longitude: number;
  latitude: number;
};

interface ReportData {
  id: number;
  text: string;
  date: string;
  active: boolean;
  reporting_user: ReportUser;
  reported_user?: ReportUser;
  reported_pin?: ReportPin;
}
/* Report END */

/* User START */
type UserData = {
  avatar: string;
  banner: string;
  email: string;
  id: string;
  name: string;
  new_notifications: string[];
  news_count: number;
  role: "user" | "admin";
  settings_id: number;
  status: "public" | "private" | "reported";
};
/* User END */

/* Notification START */
type NotificationData = {
  date: string;
  id: number;
  text: string;
  title: string;
};
/* Notification END */