"use client";

import { Button, IconButton } from "@chakra-ui/react";
import { FiShare2 } from "react-icons/fi";
import { toaster } from "@/components/toaster";

interface ShareButtonProps {
  calendarId: string;
  variant: "icon" | "full";
}

export function ShareButton({ calendarId, variant }: ShareButtonProps) {
  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    const url = `${window.location.origin}/calendars/${calendarId}`;
    navigator.clipboard.writeText(url).then(() => {
      toaster.create({
        title: "Link copied!",
        description: "Calendar link has been copied to your clipboard.",
        type: "success",
      });
    });
  }

  if (variant === "icon") {
    return (
      <IconButton
        aria-label="Share calendar"
        variant="ghost"
        size="sm"
        onClick={handleClick}
        bg="bg/80"
        backdropFilter="blur(4px)"
        _hover={{ bg: "bg" }}
      >
        <FiShare2 />
      </IconButton>
    );
  }

  return (
    <Button variant="outline" size="sm" onClick={handleClick}>
      <FiShare2 /> Share
    </Button>
  );
}
