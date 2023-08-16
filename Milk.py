import discord
from discord.ext import commands
from dotenv import load_dotenv
import os

load_dotenv()

TOKEN = os.getenv("token")

client = commands.Bot(command_prefix="/", intents=discord.Intents.all())

@client.event
async def on_ready():
    print("o/ ready for duty")

@client.command()
async def ping(ctx):
    await ctx.send("pong")


client.run('MTE0MTI1NTc4NDI3NDA4Mzg2MA.GQnjbr.owX7w6KoGcxPSQQqKkVRI84eGAF2rE-POurAV0')