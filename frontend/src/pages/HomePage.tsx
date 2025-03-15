import React, { useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { SRSStatusCard, PageContainer, ReviewDialog } from '../components';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
    const { currentUser } = React.useContext(AuthContext) || {};
    const [reviewOpen, setReviewOpen] = useState(false);

    if (!currentUser) {
        return (
            <PageContainer>
                <div className="max-w-2xl mx-auto space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Welcome to SpellWise</CardTitle>
                            <CardDescription>
                                Improve your spelling with spaced repetition and proven learning techniques.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p>Please log in or register to start learning.</p>
                            <div className="flex gap-4">
                                <Button asChild>
                                    <Link to="/login">Login</Link>
                                </Button>
                                <Button asChild variant="outline">
                                    <Link to="/register">Register</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <div className="max-w-2xl mx-auto space-y-6">
                <SRSStatusCard onReviewClick={() => setReviewOpen(true)} />
                
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Links</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <Button asChild variant="outline" className="w-full justify-start">
                                <Link to="/word-lists">
                                    Word Lists
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full justify-start">
                                <Link to="/mistake-patterns">
                                    Mistake Patterns
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <ReviewDialog 
                open={reviewOpen}
                onOpenChange={setReviewOpen}
            />
        </PageContainer>
    );
};

export default HomePage;