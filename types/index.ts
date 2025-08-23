// Core data types
export interface Exercise {
  name: string;
  sets: number;
  repLower: number;
  repUpper: number;
  weight: number;
}

export interface Routine {
  _id: string;
  userId: string;
  name: string;
  exercises: Exercise[];
  createdAt: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
}

// Component prop types
export interface RoutineCardProps {
  routine: Routine;
  routineId: string;
  isOwner?: boolean;
}

export interface LoginFormProps {
  email: string;
  password: string;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
}

export interface SignupFormProps {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  onNameChange: (name: string) => void;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onConfirmPasswordChange: (confirmPassword: string) => void;
}

export interface RoutineCardSectionProps {
  userId: string;
}

// API Response types
export interface AuthResponse {
  message: string;
  user?: User;
}

export interface ErrorResponse {
  error: string;
}

// JWT Payload type
export interface JWTPayload {
  id: string;
  email: string;
  iat?: number;
  exp?: number;
}

// Database model types (for Mongoose lean queries)
export interface LeanRoutine extends Omit<Routine, '_id'> {
  _id: any; // MongoDB ObjectId
}

export interface LeanUser extends Omit<User, '_id'> {
  _id: any; // MongoDB ObjectId
}
