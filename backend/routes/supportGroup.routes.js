const express = require('express');
const router = express.Router();
const supportGroupController = require('../controllers/supportGroup.controller');
const supportGroupDiscussionController = require('../controllers/supportGroupDiscussion.controller');
const { authJwt } = require('../middleware');

// Apply authentication middleware to all routes
router.use(authJwt.verifyToken);

// Support Group routes
router.post('/', supportGroupController.createSupportGroup);
router.get('/', supportGroupController.getSupportGroups);
router.get('/:id', supportGroupController.getSupportGroupById);
router.post('/:id/join', supportGroupController.joinSupportGroup);
router.post('/:id/leave', supportGroupController.leaveSupportGroup);
router.put('/:id', supportGroupController.updateSupportGroup);
router.post('/:id/handle-join-request', supportGroupController.handleJoinRequest);
router.post('/:id/update-moderator', supportGroupController.updateModerator);

// Support Group Discussion routes
router.post('/:groupId/discussions', supportGroupDiscussionController.createDiscussion);
router.get('/:groupId/discussions', supportGroupDiscussionController.getDiscussions);
router.get('/discussions/:id', supportGroupDiscussionController.getDiscussionById);
router.put('/discussions/:id', supportGroupDiscussionController.updateDiscussion);
router.delete('/discussions/:id', supportGroupDiscussionController.deleteDiscussion);
router.post('/discussions/:id/reply', supportGroupDiscussionController.addReply);
router.put('/discussions/:id/reply/:replyId', supportGroupDiscussionController.updateReply);
router.delete('/discussions/:id/reply/:replyId', supportGroupDiscussionController.deleteReply);
router.post('/discussions/:id/reaction', supportGroupDiscussionController.addReaction);
router.post('/discussions/:id/reply/:replyId/reaction', supportGroupDiscussionController.addReplyReaction);
router.post('/discussions/:id/pin', supportGroupDiscussionController.togglePinned);
router.post('/discussions/:id/flag', supportGroupDiscussionController.flagDiscussion);

module.exports = router; 