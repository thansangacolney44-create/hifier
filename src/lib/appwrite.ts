"use client";

import { Client, Account, Databases, Storage } from 'appwrite';

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
export const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
export const songsCollectionId = process.env.NEXT_PUBLIC_APPWRITE_SONGS_COLLECTION_ID!;
export const videosCollectionId = process.env.NEXT_PUBLIC_APPWRITE_VIDEOS_COLLECTION_ID!;
export const uploadsBucketId = process.env.NEXT_PUBLIC_APPWRITE_UPLOADS_BUCKET_ID!;

const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export default client;
