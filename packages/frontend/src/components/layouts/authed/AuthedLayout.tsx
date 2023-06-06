import styles from './AuthedLayout.module.css';
import SideNav from '@/components/navs/side/SideNav';
import SideNavMobile from '@/components/navs/side/SideNavMobile';
import useIsMobile from '@/components/utils/device/useIsMobile';

// TODO: This should pass the auth context to the side nav

export interface IAuthedLayout {}
// @ts-ignore
const AuthedLayout: React.FC<IAuthedLayout> = ({ children }) => {
  const [isMobile] = useIsMobile();

  return (
    <main className={styles.main}>
      {isMobile ? (
        <SideNavMobile>{children}</SideNavMobile>
      ) : (
        <SideNav>{children}</SideNav>
      )}
    </main>
  );
};

export default AuthedLayout;
