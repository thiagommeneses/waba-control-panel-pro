import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, User, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const UserHeader = () => {
  const { user, userRole, signOut, isAdmin } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: 'Logout realizado',
        description: 'Você foi desconectado com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro no logout',
        description: 'Ocorreu um erro ao fazer logout.',
        variant: 'destructive',
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="border-b border-border bg-card">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>
              {user?.email ? getInitials(user.email) : <User className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user?.email}</p>
            <div className="flex items-center gap-2">
              <Badge variant={isAdmin ? "default" : "secondary"} className="text-xs">
                {isAdmin ? (
                  <>
                    <Shield className="w-3 h-3 mr-1" />
                    Administrador
                  </>
                ) : (
                  'Usuário'
                )}
              </Badge>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleSignOut}>
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      </div>
    </div>
  );
};

export default UserHeader;