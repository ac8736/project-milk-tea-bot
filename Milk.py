import discord
from discord.ext import commands

client = commands.Bot(command_prefix="/", intents=discord.Intents.all())

@client.event
async def on_ready():
    print("o/ ready for duty")

@client.command()
async def ping(ctx):
    await ctx.send("pong")


client.run('') 
