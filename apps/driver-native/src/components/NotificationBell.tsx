import React from "react";
import { View, Text, ScrollView } from "react-native";
import { Badge, Button, Popover, PopoverTrigger, PopoverContent, ScrollShadow } from "heroui-native/react";
import { Feather } from "@expo/vector-icons";
import { useNotifications } from "@/hooks/useNotifications";

export interface Notification {
	id: string;
	title: string;
	message: string;
	type: "INFO" | "SUCCESS" | "WARNING" | "ERROR" | "TRIP_UPDATE" | "PAYMENT";
	createdAt: string;
	read: boolean;
	actionUrl?: string | null;
}

export const NotificationBell = () => {
	const { notifications, unreadCount } = useNotifications();

	return (
		<Popover placement='bottom-end'>
			<PopoverTrigger>
				<Button isIconOnly variant='ghost'>
					<Badge content={unreadCount} isInvisible={unreadCount === 0} variant='danger' shape='circle'>
						<Feather name="bell" width={24} />
					</Badge>
				</Button>
			</PopoverTrigger>
			<PopoverContent className='w-80'>
				<View className='px-1 py-2 w-full'>
					<Text className='text-small font-bold text-foreground'>Notifications</Text>
					<ScrollShadow className='h-[300px] w-full mt-2'>
						{notifications.length === 0 ? (
							<View className='text-center text-default-400 py-4'>No notifications</View>
						) : (
							<View className='flex flex-col gap-2'>
								{notifications.map((n) => (
									<View key={n.id} className='p-2 border-b border-default-100 last:border-0 hover:bg-default-50 transition-colors'>
										<View className='flex justify-between items-start'>
											<Text className='font-semibold text-small'>{n.title}</Text>
											<Text className='text-[10px] text-default-400 whitespace-nowrap ml-2'>{new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</Text>
										</View>
										<Text className='text-tiny text-default-500 mt-1'>{n.message}</Text>
									</View>
								))}
							</View>
						)}
					</ScrollShadow>
				</View>
			</PopoverContent>
		</Popover>
	);
};
