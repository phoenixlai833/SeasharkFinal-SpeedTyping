using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Lilou.Models;
using Microsoft.AspNetCore.SignalR;
using Lilou.Hubs;

namespace Lilou.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly DatabaseContext _context;
    private readonly IHubContext<ChatHub> _hub;

    public UsersController(DatabaseContext context, IHubContext<ChatHub> hub)
    {
        _context = context;
        _hub = hub;
    }

    // GET: api/Users
    [HttpGet]
    public async Task<ActionResult<IEnumerable<User>>> GetUsers()
    {
        if (_context.Users == null)
        {
            return NotFound();
        }
        var users = await _context.Users.ToListAsync();

        // foreach (var user in users)
        // {
        //     Console.WriteLine($"User: {user.Name}, {user.Photo}"); // accessing photo wont fail but cant manipulate it
        //     // user.Channels = await _context.Channels.Where(c => c.Users.Any(u => u.Id == user.Id)).ToListAsync();
        // }

        return users;

    }

    // GET: api/Users/5
    [HttpGet("{id}")]
    public async Task<ActionResult<User>> GetUser(int id)
    {
        if (_context.Users == null)
        {
            return NotFound();
        }
        var user = await _context.Users.FindAsync(id);

        if (user == null)
        {
            return NotFound();
        }

        return user;
    }

    // PUT: api/Users/5
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPut("{id}")]
    public async Task<IActionResult> PutUser(int id, User user)
    {
        if (id != user.Id)
        {
            return BadRequest();
        }

        _context.Entry(user).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
            await _hub.Clients.All.SendAsync("EditUser", user);
            // await _hub.Clients.Group(user.RoomId.ToString()).SendAsync("EditUser", user);

        }
        catch (DbUpdateConcurrencyException)
        {
            if (!UserExists(id))
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

    private bool UserExists(int id)
    {
        return (_context.Users?.Any(e => e.Id == id)).GetValueOrDefault();
    }

    // POST: api/Users
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPost]
    public async Task<ActionResult<User>> PostUser(User user)
    {
        // check if user exists
        // if (_context.Users.Any(u => u.UserName == user.UserName))
        // {
        //     return BadRequest("User already exists");
        // }
        var foundUser = await _context.Users.FirstOrDefaultAsync(u => u.UserName == user.UserName);
        if (foundUser != null)
        {
            return Problem("User already exists.");
        }
        if (_context.Users == null)
        {
            return Problem("Entity set 'DatabaseContext.Users'  is null.");
        }
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return CreatedAtAction("GetUser", new { id = user.Id }, user);
    }

    // DELETE: api/Users/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        if (_context.Users == null)
        {
            return NotFound();
        }
        var user = await _context.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound();
        }

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        return NoContent();
    }

}
