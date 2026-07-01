# QuickPID Django

## Overview

QuickPID Django is a web application built using Django that provides a user-friendly interface for interacting with the QuickPID Go backend. 
The Go service is responsible for creating and managing Persistent Identifiers (PIDs), while this Django application handles user authentication,
authorization, permission management, and exposes both a web interface and REST APIs for future frontend integration.

## Features Implemented

### Authentication

* User login using Django authentication.
* User logout.
* Dashboard for authenticated users.
* Superusers have unrestricted access to all operations.

### Namespace Management

* List namespaces accessible to the logged-in user.
* Create new namespaces.
* Automatically grant the creator all permissions on newly created namespaces:

  * Read
  * Create
  * Update/Delete
  * Mount
  * List


### PID Management

* Create PIDs within namespaces.
* List PIDs for namespaces where the user has List permission.
* Read PID details (public endpoint).
* Update PID metadata.
* Soft delete PIDs (internally marks the PID as deleted in the Go backend).
* Deleted PIDs are hidden from the user interface.

## REST API

The Django backend acts as an API gateway between the frontend and the Go backend.

## Technology Stack

* Python
* Django
* Django REST Framework
* SQLite
* Go Backend (accessed through REST APIs)

## Project Structure

* `accounts/` – Authentication and dashboard
* `pidmanager/` – HTML views, forms, permissions, and Go client integration
* `api/` – REST API endpoints
* `pidproject/` – Django project configuration

## Future Work

* React frontend
* JWT authentication
* Single Sign-On (SSO)
* Namespace permission management UI
* Pagination for namespaces and PIDs
* Search and filtering
* Improved error handling and logging
* API documentation using OpenAPI/Swagger
