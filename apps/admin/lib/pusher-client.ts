import Pusher from "pusher-js";

export const pusherClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || "key", {
	cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "mt1",
});
