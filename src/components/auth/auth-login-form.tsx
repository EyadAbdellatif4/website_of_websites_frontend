'use client';

import { Card } from '../ui/card';
import { Button } from '../ui/button';

export function AuthLoginForm() {
  return (
    <Card title="Sign In" description="Enter your credentials to access your account" className="w-full max-w-md">
      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">Email Address</label>
          <input
            type="email"
            placeholder="user@example.com"
            disabled
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            disabled
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none"
          />
        </div>
        <Button variant="primary" className="w-full" disabled>
          Sign In (Phase 2)
        </Button>
      </form>
    </Card>
  );
}
