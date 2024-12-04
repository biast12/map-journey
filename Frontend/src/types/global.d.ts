/* General START */
type Status = "public" | "private" | "reported" | "warning" | "banned"
type UserRole = "user" | "admin"

type UserProfile = {
  id: string;
  name: string;
  email: string;
  avatar: string;
};
/* General END */

/* Report START */
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

type ReportData = {
  id: number;
  text: string;
  date: string;
  active: boolean;
  reporting_user: UserProfile;
  reported_user?: UserProfile;
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
  role: UserRole;
  settings_id: number;
  status: Status;
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

/* Pins START */
type PinData = {
  date: string,
  description: string,
  id: string,
  imgurls: string,
  latitude: number,
  longitude: number,
  location: string,
  profile: UserProfile,
  profile_id: string,
  reported: boolean,
  status: Status,
  title: string,
}
/* Pins END */

/* Pin Search Options START */
type PinSearchOptions = {
  search: string;
  searchBy: "id" | "title" | "description";
  sortBy: "id" | "title" | "description";
  status: "all" | "public" | "private";
};
/* Pin Search Options END */