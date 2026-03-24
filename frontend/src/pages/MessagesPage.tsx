import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  TextField,
  IconButton,
  Badge,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  useTheme,
  Chip,
  Skeleton,
} from '@mui/material';
import {
  Send,
  AttachFile,
  Image,
  EmojiEmotions,
  Mic,
  Videocam,
  Call,
  MoreVert,
  ArrowBack,
  Settings,
} from '@mui/icons-material';
import { sampleConversations } from '../data/mockData';
import { AnimatedPage } from '../components/animations';
import { ConversationSkeleton, MessageBubbleSkeleton } from '../components/Skeletons';

const MessagesPage: React.FC = () => {
  const theme = useTheme();
  const [selectedConv, setSelectedConv] = useState(sampleConversations[3]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(t);
  }, []);

  const chatMessages = [
    { id: '1', type: 'received', content: 'It comes with a complete package. We get it delivered with the needed packing', time: '2:30 PM' },
    { id: '2', type: 'sent', content: 'Who delivers it?', time: '2:32 PM' },
    { id: '3', type: 'received', content: 'It comes with a complete package. We get it delivered with the needed packing', time: '2:35 PM' },
    { id: '4', type: 'sent', content: 'Thanks for such explanation.', time: '2:40 PM' },
  ];

  return (
    <AnimatedPage>
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      {/* Info Banner */}
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          mb: 2,
          border: `1px solid ${theme.palette.primary.main}30`,
          bgcolor: theme.palette.primary.main + '08',
          borderRadius: 2,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          First time Message is free, You can message mentors before booking. Messaging expires after 24 hours unless you book a session.
        </Typography>
      </Paper>

      <Box sx={{ display: 'flex', height: 'calc(100vh - 220px)', border: `1px solid ${theme.palette.divider}`, borderRadius: 3, overflow: 'hidden' }}>
        {/* Left Panel - Conversations */}
        <Box
          sx={{
            width: { xs: selectedConv ? 0 : '100%', md: 340 },
            minWidth: { md: 340 },
            borderRight: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'background.paper',
          }}
        >
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ArrowBack fontSize="small" sx={{ cursor: 'pointer' }} />
              <Typography variant="h6" fontWeight={600}>
                Messages
              </Typography>
            </Box>
            <Settings fontSize="small" sx={{ cursor: 'pointer', color: 'text.secondary' }} />
          </Box>

          {/* Message Requests */}
          <Box sx={{ px: 2, py: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="body2" fontWeight={600}>
              Message Requests
            </Typography>
            <Typography variant="caption" color="text.secondary">
              John smith: Hello!
            </Typography>
          </Box>

          <List sx={{ overflow: 'auto', flex: 1 }}>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <ConversationSkeleton key={i} />)
            ) : (
            sampleConversations.map((conv) => (
              <ListItemButton
                key={conv.id}
                selected={selectedConv?.id === conv.id}
                onClick={() => setSelectedConv(conv)}
                sx={{
                  '&.Mui-selected': {
                    bgcolor: theme.palette.primary.main + '12',
                  },
                }}
              >
                <ListItemAvatar>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                      conv.isOnline ? (
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            bgcolor: '#4CAF50',
                            borderRadius: '50%',
                            border: `2px solid ${theme.palette.background.paper}`,
                          }}
                        />
                      ) : null
                    }
                  >
                    <Avatar src={conv.participantAvatar} />
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" fontWeight={600} noWrap>
                        {conv.participantName}
                      </Typography>
                      {conv.unreadCount > 0 && (
                        <Chip
                          label={conv.unreadCount}
                          size="small"
                          color="error"
                          sx={{ height: 20, fontSize: 11, minWidth: 20 }}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" noWrap sx={{ maxWidth: 150 }}>
                        {conv.lastMessage}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {conv.lastMessageDate}
                      </Typography>
                    </Box>
                  }
                />
              </ListItemButton>
            ))
            )}
          </List>
        </Box>

        {/* Right Panel - Chat */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
          {selectedConv ? (
            <>
              {/* Chat Header */}
              <Box
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  bgcolor: 'background.paper',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar src={selectedConv.participantAvatar} sx={{ width: 36, height: 36 }} />
                  <Typography fontWeight={600}>{selectedConv.participantName}</Typography>
                </Box>
                <Box>
                  <IconButton size="small">
                    <Videocam />
                  </IconButton>
                  <IconButton size="small">
                    <Call />
                  </IconButton>
                  <IconButton size="small">
                    <MoreVert />
                  </IconButton>
                </Box>
              </Box>

              {/* Messages */}
              <Box sx={{ flex: 1, overflow: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => <MessageBubbleSkeleton key={i} sent={i % 2 === 1} />)
                ) : (
                chatMessages.map((msg) => (
                  <Box
                    key={msg.id}
                    sx={{
                      display: 'flex',
                      justifyContent: msg.type === 'sent' ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.5,
                        px: 2,
                        maxWidth: '70%',
                        borderRadius: 2,
                        bgcolor:
                          msg.type === 'sent'
                            ? theme.palette.primary.main
                            : theme.palette.background.paper,
                        color: msg.type === 'sent' ? 'white' : 'text.primary',
                        border: msg.type === 'received' ? `1px solid ${theme.palette.divider}` : 'none',
                      }}
                    >
                      <Typography variant="body2">{msg.content}</Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          textAlign: 'right',
                          mt: 0.5,
                          opacity: 0.7,
                        }}
                      >
                        {msg.time}
                      </Typography>
                    </Paper>
                  </Box>
                ))
                )}
              </Box>

              {/* Chat Input */}
              <Box
                sx={{
                  p: 1.5,
                  borderTop: `1px solid ${theme.palette.divider}`,
                  bgcolor: 'background.paper',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <IconButton size="small">
                  <AttachFile />
                </IconButton>
                <IconButton size="small">
                  <Image />
                </IconButton>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                />
                <IconButton size="small">
                  <EmojiEmotions />
                </IconButton>
                <IconButton size="small" color="primary">
                  <Send />
                </IconButton>
                <IconButton size="small">
                  <Mic />
                </IconButton>
              </Box>
            </>
          ) : (
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="text.secondary">Select a conversation</Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
    </AnimatedPage>
  );
};

export default MessagesPage;
