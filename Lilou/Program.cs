using Lilou.Models;
using Microsoft.EntityFrameworkCore;
// using Microsoft.AspNetCore.OpenApi;
using Lilou.Hubs;
using System.Text.Json.Serialization;
// using Lilou.Handlers;

DotNetEnv.Env.Load();

var builder = WebApplication.CreateBuilder(args);

//adjust these for local
var connectionString = Environment.GetEnvironmentVariable("DATABASE_CONNECTION_STRING");
// var connectionString = "Host=containers-us-west-142.railway.app;Port=6922;Database=railway;Username=postgres;Password=C7zAEKWIdeKpQi8EbBqk";

builder.Services.AddDbContext<DatabaseContext>(
    opt =>
    {
        opt.UseNpgsql(connectionString);
        if (builder.Environment.IsDevelopment())
        {
            opt
              .LogTo(Console.WriteLine, LogLevel.Information)
              .EnableSensitiveDataLogging()
              .EnableDetailedErrors();
        }
    }
);

builder.Services.AddCors(o => o.AddPolicy("CorsPolicy", builder =>
{
    builder
    .AllowAnyMethod()
    .AllowAnyHeader()
    .AllowCredentials()
    .WithOrigins("http://localhost:5276");
}));

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

builder.Services.AddEndpointsApiExplorer();
// builder.Services.AddSwaggerGen();

builder.Services.AddSignalR();

var app = builder.Build();

app.MapControllers();

// app.MapGet("/", () => "Hello World!");

app.MapHub<ChatHub>("/r/chat");

// app.MapHub<GameHub>("/r/game");

//comment out these lines for local
// app.UseDefaultFiles();
// app.UseStaticFiles();
// app.MapFallbackToFile("index.html");

app.Run();
