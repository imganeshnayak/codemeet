import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, ThumbsUp, MessageCircle, Shield } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface IssueCardProps {
    issue: any;
    index: number;
    onViewDetails: (id: string) => void;
    onVote: (id: string) => void;
    statusColors: Record<string, string>;
}

const IssueCard = React.memo(({ issue, index, onViewDetails, onVote, statusColors }: IssueCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
        >
            <Card className="p-4 hover:shadow-lg smooth-transition">
                <div
                    className="cursor-pointer"
                    onClick={() => onViewDetails(issue._id)}
                >
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Badge className={statusColors[issue.status] || 'status-pending'}>
                                {issue.status}
                            </Badge>
                            {issue.blockchainVerified && (
                                <Badge className="bg-blue-600 hover:bg-blue-700 text-xs">
                                    <Shield className="w-3 h-3 mr-1" />
                                    Verified
                                </Badge>
                            )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                            {new Date(issue.createdAt).toLocaleDateString()}
                        </span>
                    </div>

                    <h3 className="font-semibold mb-2">{issue.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {issue.description}
                    </p>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span className="line-clamp-1">
                                    {issue.location?.address || 'Location not specified'}
                                </span>
                            </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                            {issue.category}
                        </Badge>
                    </div>
                </div>

                {/* Vote and Comment Buttons */}
                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <ThumbsUp className="w-4 h-4" />
                            <span>{issue.votes || 0}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MessageCircle className="w-4 h-4" />
                            <span>{issue.comments?.length || 0}</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onVote(issue._id);
                            }}
                            className="gap-1 touch-manipulation"
                        >
                            <ThumbsUp className="w-3 h-3" />
                            <span className="hidden sm:inline">Vote</span>
                        </Button>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
});

IssueCard.displayName = 'IssueCard';

export default IssueCard;
