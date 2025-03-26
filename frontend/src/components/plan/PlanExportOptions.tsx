'use client';

import React, { useState } from 'react';
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Card,
  CardBody,
  Checkbox,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  Input,
  Link,
  Select,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useColorModeValue,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { 
  MdFileDownload, 
  MdContentCopy, 
  MdCheck,
  MdAssignment,
  MdIntegrationInstructions
} from 'react-icons/md';
import { SiJira, SiGithub, SiTrello, SiAsana } from 'react-icons/si';
import { Plan } from '@/types/plan';

interface PlanExportOptionsProps {
  projectId: string;
  plan: Plan | null;
}

export default function PlanExportOptions({ projectId, plan }: PlanExportOptionsProps) {
  const [exportFormat, setExportFormat] = useState('markdown');
  const [includeDetails, setIncludeDetails] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [selectedTool, setSelectedTool] = useState('jira');
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected'>('disconnected');
  
  const toast = useToast();
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  if (!plan) {
    return (
      <Box textAlign="center" p={8}>
        <Heading size="md">No plan available</Heading>
        <Text mt={2}>Please generate a plan first</Text>
      </Box>
    );
  }
  
  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // In a real implementation, this would call your API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: 'Plan exported successfully',
        description: `Your plan has been exported as ${exportFormat.toUpperCase()}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'There was an error exporting your plan',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleCopyToClipboard = () => {
    // In a real implementation, this would copy a formatted version of the plan
    const planText = `# ${plan.title}\n\n${plan.description}\n\n## Epics\n\n${
      plan.epics.map(epic => 
        `### ${epic.title}\n${epic.description}\n\n${
          epic.userStories.map(story => 
            `- **${story.title}**: ${story.description}`
          ).join('\n')
        }`
      ).join('\n\n')
    }`;
    
    navigator.clipboard.writeText(planText)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
        
        toast({
          title: 'Copied to clipboard',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      })
      .catch(() => {
        toast({
          title: 'Failed to copy',
          description: 'Could not copy text to clipboard',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      });
  };
  
  const handleConnect = () => {
    // In a real implementation, this would authenticate with the selected tool
    setConnectionStatus('connected');
    
    toast({
      title: 'Connection successful',
      description: `Connected to ${getToolName(selectedTool)}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };
  
  const handleSync = async () => {
    setIsExporting(true);
    
    try {
      // In a real implementation, this would sync with the selected tool
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Plan synchronized',
        description: `Your plan has been synchronized with ${getToolName(selectedTool)}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Sync failed',
        description: 'There was an error synchronizing your plan',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  const getToolName = (toolId: string): string => {
    switch (toolId) {
      case 'jira':
        return 'Jira';
      case 'github':
        return 'GitHub Projects';
      case 'trello':
        return 'Trello';
      case 'asana':
        return 'Asana';
      default:
        return 'selected tool';
    }
  };
  
  const getToolIcon = (toolId: string) => {
    switch (toolId) {
      case 'jira':
        return SiJira;
      case 'github':
        return SiGithub;
      case 'trello':
        return SiTrello;
      case 'asana':
        return SiAsana;
      default:
        return MdAssignment;
    }
  };
  
  return (
    <Box>
      <Heading size="md" mb={6}>Review and Export Plan</Heading>
      
      <Tabs colorScheme="brand" mb={6}>
        <TabList>
          <Tab>
            <Icon as={MdFileDownload} mr={2} />
            Export as File
          </Tab>
          <Tab>
            <Icon as={MdIntegrationInstructions} mr={2} />
            Integrate with Tools
          </Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel>
            <VStack align="stretch" spacing={6}>
              <Box 
                p={5} 
                borderWidth="1px" 
                borderRadius="md" 
                borderColor={borderColor}
                bg={useColorModeValue('gray.50', 'gray.800')}
              >
                <Text fontWeight="bold" mb={3}>
                  Plan Summary
                </Text>
                <VStack align="start" spacing={2}>
                  <HStack>
                    <Text fontWeight="medium" minWidth="100px">Title:</Text>
                    <Text>{plan.title}</Text>
                  </HStack>
                  <HStack align="start">
                    <Text fontWeight="medium" minWidth="100px">Description:</Text>
                    <Text>{plan.description}</Text>
                  </HStack>
                  <HStack>
                    <Text fontWeight="medium" minWidth="100px">Epics:</Text>
                    <Text>{plan.epics.length}</Text>
                  </HStack>
                  <HStack>
                    <Text fontWeight="medium" minWidth="100px">User Stories:</Text>
                    <Text>{plan.epics.reduce((acc, epic) => acc + epic.userStories.length, 0)}</Text>
                  </HStack>
                  <HStack>
                    <Text fontWeight="medium" minWidth="100px">Timeline:</Text>
                    <Text>{plan.estimatedDuration}</Text>
                  </HStack>
                </VStack>
              </Box>
              
              <Box>
                <Heading size="sm" mb={3}>Export Options</Heading>
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
                  <GridItem>
                    <FormControl>
                      <FormLabel>Export Format</FormLabel>
                      <Select 
                        value={exportFormat} 
                        onChange={(e) => setExportFormat(e.target.value)}
                      >
                        <option value="markdown">Markdown</option>
                        <option value="pdf">PDF</option>
                        <option value="excel">Excel</option>
                        <option value="json">JSON</option>
                      </Select>
                    </FormControl>
                  </GridItem>
                  
                  <GridItem>
                    <FormControl>
                      <FormLabel>Include</FormLabel>
                      <VStack align="start">
                        <Checkbox 
                          isChecked={includeDetails}
                          onChange={(e) => setIncludeDetails(e.target.checked)}
                        >
                          Include detailed descriptions
                        </Checkbox>
                      </VStack>
                    </FormControl>
                  </GridItem>
                </Grid>
              </Box>
              
              <Flex justify="space-between" wrap="wrap" gap={4}>
                <Button
                  leftIcon={isCopied ? <MdCheck /> : <MdContentCopy />}
                  onClick={handleCopyToClipboard}
                  variant="outline"
                >
                  {isCopied ? 'Copied!' : 'Copy to Clipboard'}
                </Button>
                
                <Button
                  leftIcon={<MdFileDownload />}
                  onClick={handleExport}
                  isLoading={isExporting}
                  loadingText="Exporting..."
                  variant="primary"
                >
                  Download {exportFormat.toUpperCase()}
                </Button>
              </Flex>
            </VStack>
          </TabPanel>
          
          <TabPanel>
            <VStack align="stretch" spacing={6}>
              <Text>
                Integrate your master plan with your favorite project management tools.
                This will create epics, user stories, and tasks automatically.
              </Text>
              
              <Box>
                <Heading size="sm" mb={3}>Select Integration</Heading>
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
                  <GridItem>
                    <FormControl>
                      <FormLabel>Project Management Tool</FormLabel>
                      <Select 
                        value={selectedTool} 
                        onChange={(e) => setSelectedTool(e.target.value)}
                      >
                        <option value="jira">Jira</option>
                        <option value="github">GitHub Projects</option>
                        <option value="trello">Trello</option>
                        <option value="asana">Asana</option>
                      </Select>
                    </FormControl>
                  </GridItem>
                  
                  <GridItem>
                    <FormControl>
                      <FormLabel>Connection Status</FormLabel>
                      <HStack>
                        <Icon 
                          as={getToolIcon(selectedTool)} 
                          boxSize={5} 
                          color={connectionStatus === 'connected' ? 'green.500' : 'gray.500'} 
                        />
                        <Text>
                          {connectionStatus === 'connected' 
                            ? `Connected to ${getToolName(selectedTool)}`
                            : `Not connected to ${getToolName(selectedTool)}`
                          }
                        </Text>
                      </HStack>
                    </FormControl>
                  </GridItem>
                </Grid>
              </Box>
              
              {connectionStatus === 'disconnected' ? (
                <Box>
                  <Heading size="sm" mb={3}>Connect Account</Heading>
                  <Card variant="outline">
                    <CardBody>
                      <VStack align="stretch" spacing={4}>
                        <Box>
                          <FormControl mb={4}>
                            <FormLabel>Instance URL</FormLabel>
                            <Input placeholder={`Enter your ${getToolName(selectedTool)} URL`} />
                          </FormControl>
                          
                          <FormControl>
                            <FormLabel>API Token</FormLabel>
                            <Input placeholder="Enter your API token" type="password" />
                          </FormControl>
                        </Box>
                        
                        <Text fontSize="sm" color="gray.500">
                          We'll use these credentials to securely connect to your {getToolName(selectedTool)} account.
                          Your credentials are stored securely and not shared with any third parties.
                        </Text>
                        
                        <Button onClick={handleConnect}>
                          Connect to {getToolName(selectedTool)}
                        </Button>
                      </VStack>
                    </CardBody>
                  </Card>
                </Box>
              ) : (
                <Box>
                  <Heading size="sm" mb={3}>Synchronization Settings</Heading>
                  <Card variant="outline">
                    <CardBody>
                      <VStack align="stretch" spacing={4}>
                        <FormControl>
                          <FormLabel>Project</FormLabel>
                          <Select defaultValue="default">
                            <option value="default">Select a project</option>
                            <option value="project1">Sample Project 1</option>
                            <option value="project2">Sample Project 2</option>
                          </Select>
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel>Mapping</FormLabel>
                          <VStack align="start">
                            <Checkbox defaultChecked>Map epics to {selectedTool === 'jira' ? 'Epics' : 'Milestones'}</Checkbox>
                            <Checkbox defaultChecked>Map user stories to {selectedTool === 'jira' ? 'Stories' : 'Tasks'}</Checkbox>
                            <Checkbox defaultChecked>Include acceptance criteria as {selectedTool === 'jira' ? 'Sub-tasks' : 'Checklists'}</Checkbox>
                          </VStack>
                        </FormControl>
                      </VStack>
                    </CardBody>
                  </Card>
                  
                  <Flex justify="flex-end" mt={4}>
                    <Button
                      variant="primary"
                      onClick={handleSync}
                      isLoading={isExporting}
                      loadingText="Syncing..."
                    >
                      Sync with {getToolName(selectedTool)}
                    </Button>
                  </Flex>
                </Box>
              )}
              
              <Alert status="info">
                <AlertIcon />
                <VStack align="start" spacing={0}>
                  <Text fontWeight="medium">Need help connecting your tools?</Text>
                  <Text fontSize="sm">
                    Check out our{' '}
                    <Link color="brand.500" href="#" textDecoration="underline">
                      integration guides
                    </Link>
                    {' '}for step-by-step instructions.
                  </Text>
                </VStack>
              </Alert>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
      
      <Divider my={6} />
      
      <VStack align="start" spacing={3}>
        <Heading size="sm">What happens next?</Heading>
        <Text>
          After exporting or integrating your plan, you can:
        </Text>
        <HStack align="start" spacing={4}>
          <Box
            bg="brand.50"
            color="brand.500"
            p={2}
            borderRadius="md"
            fontWeight="bold"
          >
            1
          </Box>
          <Box>
            <Text fontWeight="bold">Track Progress</Text>
            <Text color="gray.500">
              Monitor development progress using the project dashboard or your integrated tools.
            </Text>
          </Box>
        </HStack>
        <HStack align="start" spacing={4}>
          <Box
            bg="brand.50"
            color="brand.500"
            p={2}
            borderRadius="md"
            fontWeight="bold"
          >
            2
          </Box>
          <Box>
            <Text fontWeight="bold">Get Development Support</Text>
            <Text color="gray.500">
              Use Claude's coding assistance to help implement user stories.
            </Text>
          </Box>
        </HStack>
        <HStack align="start" spacing={4}>
          <Box
            bg="brand.50"
            color="brand.500"
            p={2}
            borderRadius="md"
            fontWeight="bold"
          >
            3
          </Box>
          <Box>
            <Text fontWeight="bold">Prepare for Deployment</Text>
            <Text color="gray.500">
              Generate deployment checklists when you're ready to launch.
            </Text>
          </Box>
        </HStack>
      </VStack>
    </Box>
  );
}