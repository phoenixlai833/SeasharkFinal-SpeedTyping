using Microsoft.AspNetCore.SignalR;
using Lilou;
using Lilou.Models;

namespace Lilou.Hubs;

public class ChatHub : Hub
{

    public async Task StartGame()
    {
        // UserHandler.Users.ForEach(u => u.Game.Id = 1); // 分數重算

        // // if (GameHandler.GameType == GameType.GrabWords)
        // //     GameHandler.TempQuiz = GameHandler.Quiz;

        await Clients.All.SendAsync("gameStart");
        // Console.WriteLine("Game started");
        // Clients.All.gameStart();
    }
    public async Task SendMessage(int roomId)
    {
        // Console.WriteLine("Message received: " + message);
        await Clients.All.SendAsync("ReceiveMessage", roomId);
        // await Clients.Group(roomId.ToString()).SendAsync("ReceiveMessage", message);
        // return message;
    }

    // allow someone to connect to a specific group 

    public override Task OnConnectedAsync()
    {
        Console.WriteLine("A client connected: " + Context.ConnectionId);
        return base.OnConnectedAsync();
    }

    public override Task OnDisconnectedAsync(Exception? exception)
    {
        Console.WriteLine("A client disconnected: " + Context.ConnectionId);
        return base.OnDisconnectedAsync(exception);
    }

    public async Task AddToGroup(int roomId)
    {
        // verify and authenticate the user 
        Console.WriteLine("Adding to group: " + roomId);
        await Groups.AddToGroupAsync(Context.ConnectionId, roomId.ToString());

        // await Clients.Group(groupName).SendAsync("Send", $"{Context.ConnectionId} has joined the group {groupName}.");
    }

    public async Task RemoveFromGroup(int roomId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomId.ToString());

        // await Clients.Group(groupName).SendAsync("Send", $"{Context.ConnectionId} has left the group {groupName}.");
    }

}