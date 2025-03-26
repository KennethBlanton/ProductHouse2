'use client';

import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  IconButton,
  Stack,
  Text,
  useColorMode,
  useColorModeValue,
  VStack,
  HStack,
  Grid,
  GridItem,
  Image,
  SimpleGrid,
} from '@chakra-ui/react';
import Link from 'next/link';
import { FaSun, FaMoon, FaGithub } from 'react-icons/fa';
import { SiJira, SiGithub, SiTrello, SiAsana } from 'react-icons/si';
import { MdLightbulb, MdOutlineAutoGraph, MdCode, MdOutlineRocketLaunch } from 'react-icons/md';

export default function LandingPage() {
  const { toggleColorMode } = useColorMode();
  const SwitchIcon = useColorModeValue(FaMoon, FaSun);
  const bg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.700', 'gray.100');
  const heroGradient = useColorModeValue(
    'linear(to-r, brand.500, accent.500)',
    'linear(to-r, brand.400, accent.400)'
  );

  return (
    <Box minH="100vh">
      {/* Navbar */}
      <Box 
        as="nav" 
        position="sticky" 
        top={0} 
        zIndex={10} 
        bg={bg} 
        boxShadow="sm"
        py={3}
      >
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center">
            <Heading size="md" color="brand.500">
              Claude App Dev Platform
            </Heading>
            <HStack spacing={4}>
              <Link href="/login" passHref>
                <Button variant="outline" size="sm">
                  Log In
                </Button>
              </Link>
              <Link href="/register" passHref>
                <Button variant="primary" size="sm">
                  Sign Up
                </Button>
              </Link>
              <IconButton
                aria-label="Toggle dark mode"
                icon={<SwitchIcon />}
                onClick={toggleColorMode}
                size="sm"
                variant="ghost"
              />
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Hero section */}
      <Box as="section" py={16}>
        <Container maxW="container.xl">
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={10} alignItems="center">
            <GridItem>
              <VStack spacing={6} align="flex-start">
                <Heading
                  as="h1"
                  size="2xl"
                  lineHeight="1.2"
                  bgGradient={heroGradient}
                  bgClip="text"
                >
                  Transform Ideas into Development Plans with Claude
                </Heading>
                <Text fontSize="xl" color={textColor}>
                  An end-to-end platform that helps you refine your app ideas, generate comprehensive project plans, and facilitate the development process.
                </Text>
                <HStack spacing={4}>
                  <Link href="/register" passHref>
                    <Button variant="primary" size="lg">
                      Get Started Free
                    </Button>
                  </Link>
                  <Link href="#features" passHref>
                    <Button variant="outline" size="lg">
                      Learn More
                    </Button>
                  </Link>
                </HStack>
              </VStack>
            </GridItem>
            <GridItem display={{ base: 'none', md: 'block' }}>
              {/* Placeholder for hero image */}
              <Box
                borderRadius="lg"
                bg="gray.200"
                height="400px"
                width="100%"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Text color="gray.500" fontSize="xl">Hero Image Placeholder</Text>
              </Box>
            </GridItem>
          </Grid>
        </Container>
      </Box>

      {/* Features section */}
      <Box as="section" py={16} bg={useColorModeValue('gray.50', 'gray.900')} id="features">
        <Container maxW="container.xl">
          <VStack spacing={16}>
            <VStack spacing={3}>
              <Heading textAlign="center">Key Features</Heading>
              <Text textAlign="center" maxW="container.md" fontSize="lg">
                Our platform guides you through every stage of the app development process with AI assistance.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
              {/* Feature 1 */}
              <Box 
                p={8} 
                bg={bg} 
                borderRadius="lg" 
                boxShadow="md" 
                _hover={{ transform: 'translateY(-5px)', boxShadow: 'lg' }}
                transition="all 0.3s"
              >
                <Flex direction="column" align="flex-start" height="100%">
                  <Box 
                    p={3} 
                    bg={useColorModeValue('brand.50', 'brand.900')} 
                    borderRadius="md" 
                    color="brand.500" 
                    mb={4}
                  >
                    <MdLightbulb size={24} />
                  </Box>
                  <Heading size="md" mb={4}>Idea Refinement</Heading>
                  <Text color={textColor} flex="1">
                    Engage in a conversation with Claude to refine your app concept, identify key features, and clarify your target audience and value proposition.
                  </Text>
                </Flex>
              </Box>

              {/* Feature 2 */}
              <Box 
                p={8} 
                bg={bg} 
                borderRadius="lg" 
                boxShadow="md"
                _hover={{ transform: 'translateY(-5px)', boxShadow: 'lg' }}
                transition="all 0.3s"
              >
                <Flex direction="column" align="flex-start" height="100%">
                  <Box 
                    p={3} 
                    bg={useColorModeValue('accent.50', 'accent.900')} 
                    borderRadius="md" 
                    color="accent.500" 
                    mb={4}
                  >
                    <MdOutlineAutoGraph size={24} />
                  </Box>
                  <Heading size="md" mb={4}>Master Plan Generation</Heading>
                  <Text color={textColor} flex="1">
                    Automatically generate structured project plans with epics, user stories, timelines, and resource estimates based on your refined app concept.
                  </Text>
                </Flex>
              </Box>

              {/* Feature 3 */}
              <Box 
                p={8} 
                bg={bg} 
                borderRadius="lg" 
                boxShadow="md"
                _hover={{ transform: 'translateY(-5px)', boxShadow: 'lg' }}
                transition="all 0.3s"
              >
                <Flex direction="column" align="flex-start" height="100%">
                  <Box 
                    p={3} 
                    bg={useColorModeValue('brand.50', 'brand.900')} 
                    borderRadius="md" 
                    color="brand.500" 
                    mb={4}
                  >
                    <MdCode size={24} />
                  </Box>
                  <Heading size="md" mb={4}>Development Support</Heading>
                  <Text color={textColor} flex="1">
                    Get AI-powered coding assistance, documentation generation, and interactive support throughout the development process.
                  </Text>
                </Flex>
              </Box>

              {/* Feature 4 */}
              <Box 
                p={8} 
                bg={bg} 
                borderRadius="lg" 
                boxShadow="md"
                _hover={{ transform: 'translateY(-5px)', boxShadow: 'lg' }}
                transition="all 0.3s"
              >
                <Flex direction="column" align="flex-start" height="100%">
                  <Box 
                    p={3} 
                    bg={useColorModeValue('accent.50', 'accent.900')} 
                    borderRadius="md" 
                    color="accent.500" 
                    mb={4}
                  >
                    <MdOutlineRocketLaunch size={24} />
                  </Box>
                  <Heading size="md" mb={4}>Deployment Assistance</Heading>
                  <Text color={textColor} flex="1">
                    Receive infrastructure recommendations, deployment checklists, and release management support to launch your app successfully.
                  </Text>
                </Flex>
              </Box>
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Integrations section */}
      <Box as="section" py={16}>
        <Container maxW="container.xl">
          <VStack spacing={12}>
            <VStack spacing={3}>
              <Heading textAlign="center">Seamless Integrations</Heading>
              <Text textAlign="center" maxW="container.md" fontSize="lg">
                Connect with your favorite project management tools to streamline your workflow.
              </Text>
            </VStack>

            <Flex 
              justify="center" 
              align="center" 
              wrap="wrap" 
              gap={12}
            >
              <VStack>
                <Box 
                  p={4} 
                  borderRadius="full" 
                  bg={useColorModeValue('blue.50', 'blue.900')}
                >
                  <SiJira size={40} color="#0052CC" />
                </Box>
                <Text fontWeight="bold">Jira</Text>
              </VStack>
              <VStack>
                <Box 
                  p={4} 
                  borderRadius="full" 
                  bg={useColorModeValue('purple.50', 'purple.900')}
                >
                  <SiTrello size={40} color="#0079BF" />
                </Box>
                <Text fontWeight="bold">Trello</Text>
              </VStack>
              <VStack>
                <Box 
                  p={4} 
                  borderRadius="full" 
                  bg={useColorModeValue('orange.50', 'orange.900')}
                >
                  <SiAsana size={40} color="#F06A6A" />
                </Box>
                <Text fontWeight="bold">Asana</Text>
              </VStack>
              <VStack>
                <Box 
                  p={4} 
                  borderRadius="full" 
                  bg={useColorModeValue('gray.50', 'gray.800')}
                >
                  <SiGithub size={40} />
                </Box>
                <Text fontWeight="bold">GitHub</Text>
              </VStack>
            </Flex>
          </VStack>
        </Container>
      </Box>

      {/* CTA section */}
      <Box as="section" py={16} bg={useColorModeValue('brand.50', 'brand.900')}>
        <Container maxW="container.md" textAlign="center">
          <VStack spacing={8}>
            <Heading>Ready to Transform Your App Ideas?</Heading>
            <Text fontSize="lg">
              Join our platform today and experience the power of AI-assisted app development.
            </Text>
            <HStack spacing={4}>
              <Link href="/register" passHref>
                <Button variant="primary" size="lg">
                  Sign Up Free
                </Button>
              </Link>
              <Link href="/login" passHref>
                <Button variant="outline" size="lg">
                  Log In
                </Button>
              </Link>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Footer */}
      <Box as="footer" py={12} bg={useColorModeValue('gray.100', 'gray.800')}>
        <Container maxW="container.xl">
          <Flex 
            direction={{ base: 'column', md: 'row' }} 
            justify="space-between" 
            align={{ base: 'center', md: 'flex-start' }}
            textAlign={{ base: 'center', md: 'left' }}
            gap={8}
          >
            <VStack align={{ base: 'center', md: 'flex-start' }} spacing={4}>
              <Heading size="md" color="brand.500">
                Claude App Dev Platform
              </Heading>
              <Text>
                Transform your app ideas into comprehensive development plans.
              </Text>
            </VStack>
            <VStack align={{ base: 'center', md: 'flex-start' }} spacing={4}>
              <Heading size="sm">Resources</Heading>
              <Text as="a" href="#" _hover={{ color: 'brand.500' }}>Documentation</Text>
              <Text as="a" href="#" _hover={{ color: 'brand.500' }}>Tutorials</Text>
              <Text as="a" href="#" _hover={{ color: 'brand.500' }}>Blog</Text>
            </VStack>
            <VStack align={{ base: 'center', md: 'flex-start' }} spacing={4}>
              <Heading size="sm">Company</Heading>
              <Text as="a" href="#" _hover={{ color: 'brand.500' }}>About</Text>
              <Text as="a" href="#" _hover={{ color: 'brand.500' }}>Contact</Text>
              <Text as="a" href="#" _hover={{ color: 'brand.500' }}>Privacy Policy</Text>
            </VStack>
            <VStack align={{ base: 'center', md: 'flex-start' }} spacing={4}>
              <Heading size="sm">Follow Us</Heading>
              <HStack spacing={4}>
                <IconButton
                  aria-label="GitHub"
                  icon={<FaGithub />}
                  variant="ghost"
                  size="md"
                />
              </HStack>
            </VStack>
          </Flex>
          <Box mt={12} textAlign="center">
            <Text fontSize="sm">
              &copy; {new Date().getFullYear()} Claude App Dev Platform. All rights reserved.
            </Text>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}