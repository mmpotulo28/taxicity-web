"use client";
import React from "react";
import { Badge, Button, Popover, PopoverTrigger, PopoverContent, ScrollShadow } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useNotifications } from "../hooks/useNotifications";

export const NotificationBell = () => {
	const { notifications, unreadCount } = useNotifications();

	return (
		<Popover placement='bottom-end'>
			<PopoverTrigger>
				<Button isIconOnly variant='light'>
					<Badge content={unreadCount} isInvisible={unreadCount === 0} color='danger' shape='circle'>
						<Icon icon='lucide:bell' width={24} />
					</Badge>
				</Button>
			</PopoverTrigger>
			<PopoverContent className='w-80'>
				<div className='px-1 py-2 w-full'>
					<p className='text-small font-bold text-foreground'>Notifications</p>
					<ScrollShadow className='h-[300px] w-full mt-2'>
						{notifications.length === 0 ? (
							<div className='text-center text-default-400 py-4'>No notifications</div>
						) : (
							<div className='flex flex-col gap-2'>
								{notifications.map((n) => (
									<div key={n.id} className='p-2 border-b border-default-100 last:border-0 hover:bg-default-50 transition-colors'>
										<div className='flex justify-between items-start'>
											<p className='font-semibold text-small'>{n.title}</p>
											<span className='text-[10px] text-default-400 whitespace-nowrap ml-2'>{new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
										</div>
										<p className='text-tiny text-default-500 mt-1'>{n.message}</p>
									</div>
								))}
							</div>
						)}
					</ScrollShadow>
				</div>
			</PopoverContent>
		</Popover>
	);
};
