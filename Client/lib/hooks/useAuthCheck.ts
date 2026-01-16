import { useRouter } from 'next/router';
import { useAppSelector } from '../hooks/use-store';
import protectedRoutes from '../../utils/protectedRoutes';
import { useEffect } from 'react';

const useAuthCheck = () => {
  const Router = useRouter();
  const token = useAppSelector((state) => state.user.token);

  useEffect(() => {
    if (protectedRoutes.includes(Router.pathname) && !token) {
      Router.replace('/login');
    }
  }, [Router, token]);
};

export default useAuthCheck;
