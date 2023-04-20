import { useEffect, useState } from 'react'
import './App.css'

import {
    HubConnection,
    HubConnectionBuilder,
    LogLevel
} from "@microsoft/signalr";

export default function useSignalR(url) {
    let [connection, setConnection] = useState(undefined)

    useEffect(() => {
        // Cancel everything of this compoment unmounts
        let canceled = false;

        // Build a connection to the signalR server. Automatically reconnect if the connection is lost.
        const connection = new HubConnectionBuilder()
            .withUrl(url)
            .withAutomaticReconnect()
            .configureLogging(LogLevel.Information)
            .build();

        // Try to start the connection
        connection
            .start()
            .then(() => {
                if (!canceled) {
                    setConnection(connection);
                }
            })
            .catch((error) => {
                console.log("signal error", error);
            });

        // Handle the connection closing
        connection.onclose((error) => {
            if (canceled) {
                return;
            }
            console.log("signal closed");
            setConnection(undefined);
        });

        // If the connection is lost, it won't close. Instead it will try to reconnect.
        // So we need to treat this is a lost connection until `onreconnected` is called.
        connection.onreconnecting((error) => {
            if (canceled) {
                return;
            }
            console.log("signal reconnecting");
            setConnection(undefined);
        });

        // Connection is back, yay
        connection.onreconnected((error) => {
            if (canceled) {
                return;
            }
            console.log("signal reconnected");
            setConnection(connection);
        });

        // Clean up the connection when the component unmounts
        return () => {
            canceled = true;
            connection.stop();
        };
    }, [])


    return { connection }
}