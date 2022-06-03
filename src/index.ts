// src/index.ts
import express from 'express';
import Shopify, { ApiVersion, AuthQuery } from '@shopify/shopify-api';
require('dotenv').config();

const app = express();

const { API_KEY, API_SECRET_KEY, SCOPES, HOST } = process.env;

Shopify.Context.initialize({
  API_KEY,
  API_SECRET_KEY,
  SCOPES: [SCOPES],
  HOST_NAME: HOST.replace(/https:\/\//, ""), //todo replace with input host
  IS_EMBEDDED_APP: false,
  API_VERSION: ApiVersion.October21// all supported versions are available, as well as "unstable" and "unversioned"
});

app.get('/', async (req, res) => {
    let authRoute = await Shopify.Auth.beginAuth(
      req,
      res,
      req.query.shop as string,
      '/auth/callback',
      false,
    );

    return res.redirect(authRoute);
  });

  app.get('/auth/callback', async (req, res) => {
    try {
      const session = await Shopify.Auth.validateAuthCallback(
        req,
        res,
        req.query as unknown as AuthQuery,
      ); // req.query must be cast to unkown and then AuthQuery in order to be accepted
      console.log(session);
      
      //console.log(session.scope);
      //console.log(session.accessToken);

      const client = new Shopify.Clients.Rest(session.shop, session.accessToken);
      // Use `client.get` to request the specified Shopify REST API endpoint, in this case `products`.
      const response = await client.get({
          path: 'products',
      });
  
      console.log((response.body as any).products);

      res.status(200).send("OK");
    
    } catch (error) {
      console.error(error); // in practice these should be handled more gracefully
    }

    // Load the current session to get the `accessToken`.
    //const session = await Shopify.Utils.loadCurrentSession(req, res);
    // Create a new client for the specified shop.
    
  });


// const data = await client.get({
//     path: 'products',
//   });

app.listen(3000, () => {
  console.log('your app is now listening on port 3000');
});