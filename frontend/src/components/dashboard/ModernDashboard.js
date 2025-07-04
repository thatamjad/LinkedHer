import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { 
  Plus,
  Filter,
  Search,
  Grid,
  List,
  TrendingUp,
  Users,
  MessageCircle,
  Bookmark,
  Heart,  Share2,
  MoreHorizontal,
  Calendar,
  MapPin,
  Clock,
  Award,
  Star,
  Eye,
  ArrowUp
} from 'lucide-react';
import { Card, Avatar, Badge, Button } from '../ui/ModernComponents';

// Dashboard Layout Styles
const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, 
    rgba(249, 250, 251, 1) 0%, 
    rgba(243, 244, 246, 1) 100%
  );
  padding-top: 80px; /* Account for fixed navigation */
`;

const DashboardContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  display: grid;
  grid-template-columns: 300px 1fr 300px;
  gap: 2rem;

  @media (max-width: 1200px) {
    grid-template-columns: 250px 1fr;
    
    .sidebar-right {
      display: none;
    }
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    padding: 1rem;
    gap: 1rem;
    
    .sidebar-left {
      display: none;
    }
  }
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ContentHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, #8b5fbf, #ec4899);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
`;

const ActionBar = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const SearchBar = styled.div`
  position: relative;
  min-width: 300px;
  
  @media (max-width: 768px) {
    min-width: 100%;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 2px solid var(--gray-200);
  border-radius: 1rem;
  background: white;
  font-size: 1rem;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:focus {
    outline: none;
    border-color: #8b5fbf;
    box-shadow: 0 0 0 3px rgba(139, 95, 191, 0.1);
  }

  &::placeholder {
    color: var(--gray-400);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray-400);
`;

const FilterButton = styled(Button)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ViewToggle = styled.div`
  display: flex;
  background: white;
  border: 2px solid var(--gray-200);
  border-radius: 0.75rem;
  padding: 0.25rem;
`;

const ViewButton = styled.button`
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 0.5rem;
  background: ${props => props.active ? '#8b5fbf' : 'transparent'};
  color: ${props => props.active ? 'white' : 'var(--gray-600)'};
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${props => props.active ? '#8b5fbf' : 'rgba(139, 95, 191, 0.1)'};
    color: ${props => props.active ? 'white' : '#8b5fbf'};
  }
`;

const ProfileCard = styled(Card)`
  padding: 2rem;
  text-align: center;
  background: linear-gradient(135deg, rgba(139, 95, 191, 0.05), rgba(236, 72, 153, 0.05));
`;

const ProfileAvatar = styled.div`
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
`;

const ProfileName = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0 0 0.5rem 0;
`;

const ProfileTitle = styled.p`
  color: var(--gray-600);
  margin: 0 0 1rem 0;
`;

const ProfileStats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--gray-900);
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: var(--gray-500);
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const QuickActions = styled(Card)`
  padding: 1.5rem;
`;

const QuickActionsTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--gray-900);
  margin: 0 0 1rem 0;
`;

const ActionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const ActionItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.75rem;
  background: rgba(139, 95, 191, 0.02);
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(139, 95, 191, 0.05);
    border-color: rgba(139, 95, 191, 0.1);
  }
`;

const ActionIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, rgba(139, 95, 191, 0.1), rgba(236, 72, 153, 0.1));
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8b5fbf;
`;

const ActionText = styled.div`
  flex: 1;
`;

const ActionLabel = styled.div`
  font-weight: 500;
  color: var(--gray-900);
  margin-bottom: 0.25rem;
`;

const ActionDescription = styled.div`
  font-size: 0.875rem;
  color: var(--gray-500);
`;

const PostCard = styled(Card)`
  padding: 1.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  }
`;

const PostHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const PostAuthorInfo = styled.div`
  flex: 1;
`;

const PostAuthorName = styled.div`
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: 0.25rem;
`;

const PostAuthorTitle = styled.div`
  font-size: 0.875rem;
  color: var(--gray-500);
  margin-bottom: 0.25rem;
`;

const PostTime = styled.div`
  font-size: 0.75rem;
  color: var(--gray-400);
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const PostContent = styled.div`
  margin-bottom: 1rem;
`;

const PostText = styled.p`
  color: var(--gray-700);
  line-height: 1.6;
  margin: 0 0 1rem 0;
`;

const PostImage = styled.img`
  width: 100%;
  border-radius: 0.75rem;
  margin-bottom: 1rem;
`;

const PostActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 1rem;
  border-top: 1px solid var(--gray-100);
`;

const PostActionGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const PostAction = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 0.5rem;
  background: transparent;
  color: var(--gray-600);
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;

  &:hover {
    background: rgba(139, 95, 191, 0.05);
    color: #8b5fbf;
  }

  ${props => props.active && `
    color: #8b5fbf;
    background: rgba(139, 95, 191, 0.1);
  `}
`;

const TrendingCard = styled(Card)`
  padding: 1.5rem;
`;

const TrendingTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--gray-900);
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const TrendingList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const TrendingItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 0.75rem;
  background: rgba(139, 95, 191, 0.02);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(139, 95, 191, 0.05);
  }
`;

const TrendingNumber = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 0.5rem;
  background: linear-gradient(135deg, #8b5fbf, #ec4899);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
`;

const TrendingContent = styled.div`
  flex: 1;
`;

const TrendingItemTitle = styled.div`
  font-weight: 500;
  color: var(--gray-900);
  margin-bottom: 0.25rem;
`;

const TrendingMeta = styled.div`
  font-size: 0.75rem;
  color: var(--gray-500);
`;

const CreatePostCard = styled(Card)`
  padding: 1.5rem;
  border: 2px dashed var(--gray-200);
  background: linear-gradient(135deg, rgba(139, 95, 191, 0.02), rgba(236, 72, 153, 0.02));
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    border-color: #8b5fbf;
    background: linear-gradient(135deg, rgba(139, 95, 191, 0.05), rgba(236, 72, 153, 0.05));
  }
`;

const CreatePostContent = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const CreatePostText = styled.div`
  flex: 1;
  color: var(--gray-600);
  font-size: 1.125rem;
`;

const CreatePostIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, #8b5fbf, #ec4899);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModernDashboard = ({ 
  user, 
  posts = [], 
  onCreatePost,
  onPostAction 
}) => {
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const quickActions = [
    {
      icon: <MessageCircle size={20} />,
      label: "Send Message",
      description: "Connect with professionals",
      action: () => console.log('Send message')
    },
    {
      icon: <Users size={20} />,
      label: "Find Mentors",
      description: "Discover industry experts",
      action: () => console.log('Find mentors')
    },
    {
      icon: <Calendar size={20} />,
      label: "Schedule Meeting",
      description: "Book networking sessions",
      action: () => console.log('Schedule meeting')
    },
    {
      icon: <Award size={20} />,
      label: "Skills Assessment",
      description: "Evaluate your abilities",
      action: () => console.log('Skills assessment')
    }
  ];

  const trendingTopics = [
    {
      title: "Women in Tech Leadership",
      posts: "2.5K posts",
      growth: "+15%"
    },
    {
      title: "Remote Work Culture",
      posts: "1.8K posts",
      growth: "+23%"
    },
    {
      title: "Salary Negotiation Tips",
      posts: "1.2K posts",
      growth: "+8%"
    },
    {
      title: "Career Pivot Stories",
      posts: "956 posts",
      growth: "+31%"
    },
    {
      title: "Work-Life Balance",
      posts: "743 posts",
      growth: "+12%"
    }
  ];

  const mockPosts = posts.length > 0 ? posts : [
    {
      id: 1,
      author: {
        name: "Sarah Chen",
        title: "Senior Software Engineer at Google",
        avatar: "/api/placeholder/50/50",
        verified: true
      },
      content: "Just completed my first quarter leading a diverse team of 12 engineers. The key to success? Creating psychological safety where everyone feels heard and valued. Here's what I learned...",
      image: "/api/placeholder/600/300",
      timeAgo: "2 hours ago",
      likes: 142,
      comments: 28,
      shares: 15,
      liked: false,
      saved: false
    },
    {
      id: 2,
      author: {
        name: "Dr. Aisha Patel",
        title: "Research Director at Stanford",
        avatar: "/api/placeholder/50/50",
        verified: true
      },
      content: "Excited to announce our new research on AI bias in hiring processes. The findings are eye-opening and will hopefully drive meaningful change in how companies approach technical recruiting.",
      timeAgo: "4 hours ago",
      likes: 89,
      comments: 16,
      shares: 23,
      liked: true,
      saved: true
    }
  ];

  return (
    <DashboardContainer>
      <DashboardContent>
        {/* Left Sidebar */}
        <Sidebar className="sidebar-left">
          <ProfileCard>
            <ProfileAvatar>
              <Avatar 
                src={user?.avatar} 
                name={user?.name} 
                size="xl"
                status="online"
              />
            </ProfileAvatar>
            <ProfileName>{user?.name || "Jane Doe"}</ProfileName>
            <ProfileTitle>{user?.title || "Product Manager"}</ProfileTitle>
            <Badge color="primary" variant="soft">
              Verified Professional
            </Badge>
            
            <ProfileStats>
              <StatItem>
                <StatNumber>1.2K</StatNumber>
                <StatLabel>Connections</StatLabel>
              </StatItem>
              <StatItem>
                <StatNumber>45</StatNumber>
                <StatLabel>Posts</StatLabel>
              </StatItem>
              <StatItem>
                <StatNumber>890</StatNumber>
                <StatLabel>Views</StatLabel>
              </StatItem>
            </ProfileStats>
          </ProfileCard>

          <QuickActions>
            <QuickActionsTitle>Quick Actions</QuickActionsTitle>
            <ActionList>
              {quickActions.map((action, index) => (
                <ActionItem
                  key={index}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={action.action}
                >
                  <ActionIcon>
                    {action.icon}
                  </ActionIcon>
                  <ActionText>
                    <ActionLabel>{action.label}</ActionLabel>
                    <ActionDescription>{action.description}</ActionDescription>
                  </ActionText>
                </ActionItem>
              ))}
            </ActionList>
          </QuickActions>
        </Sidebar>

        {/* Main Content */}
        <MainContent>
          <ContentHeader>
            <PageTitle>Your Feed</PageTitle>
            <ActionBar>
              <SearchBar>
                <SearchIcon>
                  <Search size={18} />
                </SearchIcon>
                <SearchInput
                  placeholder="Search posts, people, companies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </SearchBar>
              <FilterButton variant="outline" leftIcon={<Filter size={18} />}>
                Filter
              </FilterButton>
              <ViewToggle>
                <ViewButton 
                  active={viewMode === 'grid'}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid size={18} />
                </ViewButton>
                <ViewButton 
                  active={viewMode === 'list'}
                  onClick={() => setViewMode('list')}
                >
                  <List size={18} />
                </ViewButton>
              </ViewToggle>
            </ActionBar>
          </ContentHeader>

          <CreatePostCard onClick={onCreatePost}>
            <CreatePostContent>
              <Avatar 
                src={user?.avatar} 
                name={user?.name} 
                size="md"
              />
              <CreatePostText>
                Share your professional insights...
              </CreatePostText>
              <CreatePostIcon>
                <Plus size={24} />
              </CreatePostIcon>
            </CreatePostContent>
          </CreatePostCard>

          <motion.div
            layout
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem'
            }}
          >
            <AnimatePresence>
              {mockPosts.map((post) => (
                <motion.div
                  key={post.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <PostCard>
                    <PostHeader>
                      <Avatar 
                        src={post.author.avatar}
                        name={post.author.name}
                        size="md"
                      />
                      <PostAuthorInfo>
                        <PostAuthorName>
                          {post.author.name}
                          {post.author.verified && (
                            <Badge 
                              color="primary" 
                              size="sm" 
                              style={{ marginLeft: '0.5rem' }}
                            >
                              <Star size={12} style={{ marginRight: '0.25rem' }} />
                              Verified
                            </Badge>
                          )}
                        </PostAuthorName>
                        <PostAuthorTitle>{post.author.title}</PostAuthorTitle>
                        <PostTime>
                          <Clock size={12} />
                          {post.timeAgo}
                        </PostTime>
                      </PostAuthorInfo>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal size={18} />
                      </Button>
                    </PostHeader>

                    <PostContent>
                      <PostText>{post.content}</PostText>
                      {post.image && (
                        <PostImage src={post.image} alt="Post content" />
                      )}
                    </PostContent>

                    <PostActions>
                      <PostActionGroup>
                        <PostAction
                          active={post.liked}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onPostAction?.('like', post.id)}
                        >
                          <Heart size={16} fill={post.liked ? '#ec4899' : 'none'} />
                          {post.likes}
                        </PostAction>
                        <PostAction
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onPostAction?.('comment', post.id)}
                        >
                          <MessageCircle size={16} />
                          {post.comments}
                        </PostAction>
                        <PostAction
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onPostAction?.('share', post.id)}
                        >
                          <Share2 size={16} />
                          {post.shares}
                        </PostAction>
                      </PostActionGroup>
                      <PostAction
                        active={post.saved}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onPostAction?.('save', post.id)}
                      >
                        <Bookmark size={16} fill={post.saved ? '#8b5fbf' : 'none'} />
                      </PostAction>
                    </PostActions>
                  </PostCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </MainContent>

        {/* Right Sidebar */}
        <Sidebar className="sidebar-right">
          <TrendingCard>
            <TrendingTitle>
              <TrendingUp size={20} />
              Trending Topics
            </TrendingTitle>
            <TrendingList>
              {trendingTopics.map((topic, index) => (
                <TrendingItem
                  key={index}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <TrendingNumber>{index + 1}</TrendingNumber>
                  <TrendingContent>
                    <TrendingItemTitle>{topic.title}</TrendingItemTitle>
                    <TrendingMeta>
                      {topic.posts} • {topic.growth} <ArrowUp size={12} style={{ display: 'inline' }} />
                    </TrendingMeta>
                  </TrendingContent>
                </TrendingItem>
              ))}
            </TrendingList>
          </TrendingCard>

          <Card padding="1.5rem">
            <h3 style={{ 
              fontSize: '1.125rem',
              fontWeight: 600,
              color: 'var(--gray-900)',
              margin: '0 0 1rem 0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Eye size={20} />
              Who Viewed Your Profile
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <Avatar 
                    src={`/api/placeholder/40/40?face=${i}`}
                    size="sm"
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, color: 'var(--gray-900)' }}>
                      Professional {i}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
                      2 hours ago
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Sidebar>
      </DashboardContent>
    </DashboardContainer>
  );
};

export default ModernDashboard;
