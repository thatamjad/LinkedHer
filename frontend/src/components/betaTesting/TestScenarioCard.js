import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaClipboardCheck, FaPlay, FaClock, FaCheck, FaTasks } from 'react-icons/fa';

// Get priority color utility function
const getPriorityColor = (priority) => {
  switch (priority) {
    case 'critical':
      return '#dc3545';
    case 'high':
      return '#fd7e14';
    case 'medium':
      return '#ffc107';
    case 'low':
      return '#28a745';
    default:
      return '#6c757d';
  }
};

const TestScenarioCard = ({ scenario, onStart, isAssigned, isCompleted }) => {
  const {
    _id,
    title,
    description,
    featureArea,
    priority,
    steps,
    expectedDuration,
    status
  } = scenario;

  // Format estimated duration
  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 
        ? `${hours} hr ${remainingMinutes} min` 
        : `${hours} hr`;
    }
  };

  // Get feature area icon
  const getFeatureAreaIcon = (area) => {
    switch (area) {
      case 'professionalMode':
        return '👔';
      case 'anonymousMode':
        return '🕵️';
      case 'verification':
        return '✅';
      case 'jobBoard':
        return '💼';
      case 'mentorship':
        return '🧠';
      case 'supportGroups':
        return '👥';
      case 'skillGap':
        return '📊';
      case 'negotiation':
        return '🤝';
      case 'security':
        return '🔒';
      case 'modeSwitch':
        return '🔄';
      case 'reporting':
        return '📝';
      case 'onboarding':
        return '🚀';
      default:
        return '📱';
    }
  };

  // Format feature area name
  const formatFeatureArea = (area) => {
    return area
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase());
  };

  return (
    <Card priority={priority} isCompleted={isCompleted}>
      {isCompleted && <CompletedBadge><FaCheck /> Completed</CompletedBadge>}
      
      <CardHeader>
        <PriorityBadge priority={priority}>
          {priority.charAt(0).toUpperCase() + priority.slice(1)}
        </PriorityBadge>
        <FeatureAreaBadge>
          {getFeatureAreaIcon(featureArea)} {formatFeatureArea(featureArea)}
        </FeatureAreaBadge>
      </CardHeader>
      
      <CardTitle>{title}</CardTitle>
      
      <CardDescription>{description}</CardDescription>
      
      <CardInfo>
        <InfoItem>
          <FaTasks />
          <span>{steps.length} steps</span>
        </InfoItem>
        <InfoItem>
          <FaClock />
          <span>{formatDuration(expectedDuration)}</span>
        </InfoItem>
      </CardInfo>
      
      <CardFooter>
        {isCompleted ? (
          <ViewResultsButton to={`/beta-testing/scenarios/${_id}/results`}>
            View Your Feedback
          </ViewResultsButton>
        ) : isAssigned ? (
          <StartButton onClick={() => onStart(_id)}>
            <FaPlay /> Start Testing
          </StartButton>
        ) : (
          <DisabledButton>
            <FaClipboardCheck /> Not Assigned
          </DisabledButton>
        )}
        
        <DetailsLink to={`/beta-testing/scenarios/${_id}`}>
          View Details
        </DetailsLink>
      </CardFooter>
    </Card>
  );
};

// Styled Components
const Card = styled.div`
  position: relative;
  background-color: #fff;
  border-radius: 10px;
  border-top: 4px solid ${props => getPriorityColor(props.priority)};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
  transition: transform 0.2s, box-shadow 0.2s;
  opacity: ${props => props.isCompleted ? 0.8 : 1};
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
`;

const CompletedBadge = styled.div`
  position: absolute;
  top: -10px;
  right: 20px;
  background-color: var(--success-green);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  box-shadow: 0 2px 8px rgba(39, 174, 96, 0.3);
  z-index: 1;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const PriorityBadge = styled.span`
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.35rem 0.75rem;
  border-radius: 4px;
  background-color: ${props => getPriorityColor(props.priority) + '20'};
  color: ${props => getPriorityColor(props.priority)};
`;

const FeatureAreaBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  color: #6c757d;
`;

const CardTitle = styled.h3`
  font-size: 1.25rem;
  color: var(--professional-navy);
  margin-bottom: 0.75rem;
  line-height: 1.4;
`;

const CardDescription = styled.p`
  font-size: 0.875rem;
  color: #6c757d;
  margin-bottom: 1rem;
  line-height: 1.5;
  
  /* Limit to 3 lines */
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CardInfo = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.25rem;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6c757d;
  
  svg {
    color: var(--primary-purple);
  }
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StartButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1rem;
  background-color: var(--primary-purple);
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.15s;
  
  &:hover {
    background-color: #7b4fb0;
  }
`;

const DisabledButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1rem;
  background-color: #e9ecef;
  color: #6c757d;
  font-size: 0.875rem;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  cursor: not-allowed;
`;

const ViewResultsButton = styled(Link)`
  display: inline-block;
  padding: 0.65rem 1rem;
  background-color: var(--success-green);
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 6px;
  text-decoration: none;
  transition: background-color 0.15s;
  
  &:hover {
    background-color: #219a52;
  }
`;

const DetailsLink = styled(Link)`
  font-size: 0.875rem;
  color: var(--primary-purple);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.15s;
  
  &:hover {
    color: #7b4fb0;
    text-decoration: underline;
  }
`;

export default TestScenarioCard; 