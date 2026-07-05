export interface User {
  id: string;
  email: string;
}

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
}
