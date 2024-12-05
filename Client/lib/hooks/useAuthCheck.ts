import { useRouter } from 'next/router';
import { useAppSelector } from '../../api/fetchData';
import protectedRoutes from '../../utils/protectedRoutes';
import { useEffect } from 'react';

const useAuthCheck = () => {
  const Router = useRouter();
  const token = useAppSelector((state) => state.user.token);

  useEffect(() => {
    if (protectedRoutes.includes(Router.pathname) && !token) {
      Router.replace('/login');
    }
  }, [Router.pathname, token]);
};

export default useAuthCheck;
