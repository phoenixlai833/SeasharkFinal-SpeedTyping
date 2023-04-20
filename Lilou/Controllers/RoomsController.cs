using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
namespace Lilou.Models;
using Microsoft.AspNetCore.SignalR;
using Lilou.Hubs;
// using global::Lilou.Hubs;

// namespace Lilou.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RoomsController : ControllerBase
{
    private readonly DatabaseContext _context;
    private readonly IHubContext<ChatHub> _hub;

    // accept the hub here
    public RoomsController(DatabaseContext context, IHubContext<ChatHub> hub)
    {
        _context = context;
        _hub = hub;
    }

    // GET: api/Rooms
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Room>>> GetRooms()
    {
        if (_context.Rooms == null)
        {
            return NotFound();
        }

        var results = await _context.Rooms.Include(c => c.Users)
    // .Select(c => new RoomDTO
    // {
    //     Id = c.Id,
    //     Name = c.Name,
    //     CreatedAt = c.CreatedAt,
    //     TotalUsers = c.Users.Count
    // })
    // .OrderByDescending(c => c.TotalUsers)
    .ToListAsync();

        return results;
    }

    // GET: api/Rooms/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Room>> GetRoom(int id)
    {
        var Room = await _context.Rooms.FindAsync(id);

        if (Room == null)
        {
            return NotFound();
        }

        return Room;
    }

    // POST: api/Rooms
    [HttpPost]
    public async Task<ActionResult<Room>> PostRoom(Room Room)
    {
        // check if room exists
        var room = await _context.Rooms.FirstOrDefaultAsync(r => r.RoomName == Room.RoomName);
        if (room != null)
        {
            return Problem("Room already exists.");
        }
        if (_context.Rooms == null)
        {
            return Problem("Entity set 'DatabaseContext.Rooms'  is null.");
        }
        _context.Rooms.Add(Room);
        await _context.SaveChangesAsync();


        await _hub.Clients.All.SendAsync("AddRoom", Room);
        // await _hub.Clients.All.SendAsync("ReceiveMessage", Room);

        return CreatedAtAction(nameof(GetRoom), new { id = Room.Id }, Room);

    }

    // PUT: api/Rooms/5
    [HttpPut("{id}")]
    public async Task<ActionResult<Room>> PutRoom(int id, Room Room)
    {
        if (id != Room.Id)
        {
            return BadRequest();
        }

        try
        {
            Console.WriteLine("PUT: " + Room.Users);
            _context.Entry(Room).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            await _hub.Clients.All.SendAsync("EditRoom", Room);
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!RoomExists(id))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }

        return NoContent();
    }

    // PUT: api/Rooms/5/Users/5
    [HttpPut("{RoomId}/Users/{userId}")]
    public async Task<IActionResult> AddUserToRoom(int RoomId, int userId)
    {
        var room = await _context.Rooms.FindAsync(RoomId);
        var user = await _context.Users.FindAsync(userId);
        if (room == null || user == null)
        {
            return NotFound();
        }

        // user.Room.Add(room); //// whaaaaaaat

        room.Users.Add(user);
        _context.Entry(room).State = EntityState.Modified;
        _context.Entry(user).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!RoomExists(RoomId))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }

        var RoomUser = new { RoomId = RoomId, UserId = userId };

        // await _hub.Clients.All.SendAsync("UpdateUsersRoom", room);
        // await _hub.Clients.Group(RoomId.ToString()).SendAsync("AddUserToRoom", user);

        return NoContent();
    }

    private bool RoomExists(int id)
    {
        return (_context.Rooms?.Any(e => e.Id == id)).GetValueOrDefault();
    }

    // DELETE: api/Rooms/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRoom(int id)
    {
        var Room = await _context.Rooms.FindAsync(id);
        if (Room == null)
        {
            return NotFound();
        }


        _context.Rooms.Remove(Room);
        await _context.SaveChangesAsync();

        await _hub.Clients.All.SendAsync("DeleteRoom", Room);

        return NoContent();
    }
}