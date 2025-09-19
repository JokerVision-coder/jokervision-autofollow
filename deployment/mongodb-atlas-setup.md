# MongoDB Atlas Setup for JokerVision AutoFollow

## 1. Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Verify your email address

## 2. Create a New Cluster

1. Click "Create a New Cluster"
2. Choose **Shared Clusters** (Free tier)
3. Select **AWS** as cloud provider
4. Choose **N. Virginia (us-east-1)** region
5. Select **M0 Sandbox** (Free forever)
6. Cluster Name: `jokervision-production`
7. Click **Create Cluster**

## 3. Configure Database Access

1. Go to **Database Access** in left sidebar
2. Click **Add New Database User**
3. Choose **Password** authentication
4. Username: `jokervision-admin`
5. Generate a secure password (save this!)
6. Database User Privileges: **Read and write to any database**
7. Click **Add User**

## 4. Configure Network Access

1. Go to **Network Access** in left sidebar
2. Click **Add IP Address**
3. Choose **Allow access from anywhere** (0.0.0.0/0)
   - Or add specific Railway IP ranges for better security
4. Click **Confirm**

## 5. Get Connection String

1. Go to **Clusters** in left sidebar
2. Click **Connect** on your cluster
3. Choose **Connect your application**
4. Select **Node.js** and version **4.1 or later**
5. Copy the connection string:
   ```
   mongodb+srv://jokervision-admin:<password>@jokervision-production.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your actual password
7. Add database name: `/jokervision_production`

## 6. Final Connection String Format

```
mongodb+srv://jokervision-admin:YOUR_PASSWORD@jokervision-production.xxxxx.mongodb.net/jokervision_production?retryWrites=true&w=majority
```

## 7. Test Connection

Use this connection string in your Railway environment variables as `MONGO_URL`.

## 8. Optional: Enable MongoDB Compass

1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Use the same connection string to view your data
3. Great for debugging and data management

## Security Best Practices

- Use strong passwords for database users
- Limit IP addresses in production
- Enable database auditing in Atlas
- Set up monitoring and alerts
- Regular backups (automatic in Atlas)