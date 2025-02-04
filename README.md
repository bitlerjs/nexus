# Nexus

Nexus is a platform for rabitly building and deploying agent backed applications. It centers around micro tasks, which are small standalone tasks which can be composed together into agents and used to build any feature on top of with tools for testing and tracing build right in.

## Features

- **Great developer experience**: Comes with both a studio that allows you to experiments, and a client generator which will create strongly typed clients for both end-user products, automations and experimentation. It also ensures that everything is transparent by enable you to easily visualise exactly what happened.

- **OpenAPI enabled**: Everything available to the agents is also available through a HTTP API with an OpenAPI specification, and existing OpenAPI specifications can be loaded directly in as tasks that agents can use, so tools for both extending and consuming the platform is available for all mayor languages from day one.

* **Federated by design**: Build servers as individual units and combine them to larger ones using federation, or enhance you local development by federating a deployed server with your local tasks to quickly experiment with new capabilities.

## Try the demo

Clone the repo and run `pnpm install && pnpm demo` - now go to `http://localhost:4000` and play around in the studio

## Getting started

Create a new node project by running `pnpm init` and then install "Nexus Studio" by running `pnpm add @bitlerjs/nexus-studio`

You can create the initial project scaffold by running `pnpm nexus init`.

After running this command a new `nexus.config.ts` will be created.

To start the server run `pnpm nexus studio start` and navigate to `http://localhost:6005` to get started.
