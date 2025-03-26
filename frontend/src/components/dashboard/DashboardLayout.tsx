'use client';

import { ReactNode, useState } from 'react';
import {
  Box,
  Flex,
  HStack,
  IconButton,
  useColorModeValue,
  Text,
  useColorMode,
  Container,
  VStack,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  useDisclosure,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Image,
  Button,
} from '@chakra-ui/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaSun, FaMoon, FaBars, FaChevronRight } from 'react-icons/fa';
import { MdDashboard, MdApps, MdCode, MdSettings, MdLogout } from 'react-icons/md';
import { useAuth } from '@/components/auth/AuthProvider';

type NavItemProps = {
  icon: React.ElementType;
  href: string;
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
};

const NavItem = ({ icon, href, children, active, onClick }: NavItemProps) => {
  const bgActive = useColorModeValue('brand.50', 'brand.900');
  const bgHover = useColorModeValue('gray.100', 'gray.700');
  const textColorActive = useColorModeValue('brand.600', 'brand.300');
  
  return (
    <Link href={href} passHref>
      <Flex
        align="center"
        p="4"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        bg={active ? bgActive : 'transparent'}
        color={active ? textColorActive : undefined}
        _hover={{
          bg: active ? bgActive : bgHover,
        }}
        onClick={onClick}
      >
        <Box mr="4" fontSize="lg">
          {icon && <Box as={icon} />}
        </Box>
        <Text fontWeight={active ? 'semibold' : 'normal'}>{children}</Text>
      </Flex>
    </Link>
  );
};

type SidebarProps = {
  onClose: () => void;
  display: { base: string; md: string };
};

const Sidebar = ({ onClose, display }: SidebarProps) => {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  return (
    <Box
      bg={useColorModeValue('white', 'gray.800')}
      borderRight="1px"
      borderRightColor={useColorModeValue('gray.200', 'gray.700')}
      w={{ base: 'full', md: 60 }}
      pos="fixed"
      h="full"
      display={display}
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Text fontSize="2xl" fontWeight="bold" color="brand.500">
          Claude Dev
        </Text>
        <Box display={{ base: 'block', md: 'none' }}>
          <IconButton
            aria-label="Close menu"
            icon={<FaChevronRight />}
            onClick={onClose}
            variant="ghost"
          />
        </Box>
      </Flex>
      <VStack align="stretch" spacing={1} mt={4}>
        <NavItem icon={MdDashboard} href="/dashboard" active={isActive('/dashboard')} onClick={onClose}>
          Dashboard
        </NavItem>
        <NavItem icon={MdApps} href="/projects" active={isActive('/projects')} onClick={onClose}>
          Projects
        </NavItem>
        <NavItem icon={MdCode} href="/templates" active={isActive('/templates')} onClick={onClose}>
          Templates
        </NavItem>
        <NavItem icon={MdSettings} href="/settings" active={isActive('/settings')} onClick={onClose}>
          Settings
        </NavItem>
      </VStack>
    </Box>
  );
};

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, signOut } = useAuth();
  const { colorMode, toggleColorMode } = useColorMode();
  const pathname = usePathname();
  
  // Generate breadcrumbs from pathname
  const generateBreadcrumbs = () => {
    if (!pathname) return [];
    
    const paths = pathname.split('/').filter(path => path);
    let currentPath = '';
    
    return paths.map((path, index) => {
      currentPath += `/${path}`;
      const isLast = index === paths.length - 1;
      
      // Format the breadcrumb label
      const label = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
      
      return {
        label,
        href: currentPath,
        isLast,
      };
    });
  };
  
  const breadcrumbs = generateBreadcrumbs();

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      {/* Sidebar for mobile */}
      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            Claude App Dev Platform
          </DrawerHeader>
          <DrawerBody p={0}>
            <Sidebar onClose={onClose} display={{ base: 'block', md: 'none' }} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
      
      {/* Sidebar for desktop */}
      <Sidebar onClose={onClose} display={{ base: 'none', md: 'block' }} />
      
      {/* Main content */}
      <Box ml={{ base: 0, md: 60 }} p={4}>
        {/* Navbar */}
        <Flex
          as="header"
          align="center"
          justify="space-between"
          w="full"
          px={4}
          bg={useColorModeValue('white', 'gray.800')}
          borderBottomWidth="1px"
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          h="16"
          mb={4}
          pos="sticky"
          top="0"
          zIndex="1"
        >
          <IconButton
            display={{ base: 'flex', md: 'none' }}
            onClick={onOpen}
            variant="outline"
            aria-label="open menu"
            icon={<FaBars />}
          />
          
          <Breadcrumb separator="/">
            <BreadcrumbItem>
              <BreadcrumbLink as={Link} href="/dashboard">
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            {breadcrumbs.map((breadcrumb, index) => (
              <BreadcrumbItem key={index} isCurrentPage={breadcrumb.isLast}>
                <BreadcrumbLink
                  as={Link}
                  href={breadcrumb.href}
                  isCurrentPage={breadcrumb.isLast}
                >
                  {breadcrumb.label}
                </BreadcrumbLink>
              </BreadcrumbItem>
            ))}
          </Breadcrumb>
          
          <HStack spacing={3}>
            <IconButton
              aria-label="Toggle dark mode"
              icon={colorMode === 'dark' ? <FaSun /> : <FaMoon />}
              onClick={toggleColorMode}
              variant="ghost"
            />
            
            <Menu>
              <MenuButton
                as={Button}
                rounded="full"
                variant="link"
                cursor="pointer"
                minW={0}
              >
                <Avatar
                  size="sm"
                  name={user?.username || 'User'}
                />
              </MenuButton>
              <MenuList>
                <Text px={3} py={2} fontWeight="medium">
                  {user?.username || 'User'}
                </Text>
                <Text px={3} pb={2} fontSize="sm" color="gray.500">
                  {user?.email || 'user@example.com'}
                </Text>
                <MenuDivider />
                <MenuItem as={Link} href="/profile">
                  Profile
                </MenuItem>
                <MenuItem as={Link} href="/settings">
                  Settings
                </MenuItem>
                <MenuDivider />
                <MenuItem onClick={signOut} icon={<MdLogout />} color="red.500">
                  Sign out
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Flex>
        
        {/* Page content */}
        <Container maxW="container.xl" pt={4} pb={10}>
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default DashboardLayout;