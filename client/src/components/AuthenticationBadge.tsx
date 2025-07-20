import { Shield } from 'lucide-react';

export default function AuthenticationBadge() {
  return (
    <div className="auth-badge">
      <Shield className="w-3 h-3" />
      <span>Authenticated</span>
    </div>
  );
}
