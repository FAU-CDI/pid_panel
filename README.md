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

The project exposes a REST API for managing namespaces, PIDs, and namespace roles. All endpoints return JSON responses.
The Django backend acts as an API gateway between the frontend and the Go backend.

### Authentication

All endpoints require an authenticated user **except** retrieving an individual PID, which is publicly accessible.

### Endpoints

| Method   | Endpoint                                            | Description                                                                                              |
| -------- | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `GET`    | `/pid/me`                                       | Returns information about the currently authenticated user.                                              |
| `GET`    | `/pid/namespaces`                                | Lists all namespaces the authenticated user has access to, along with their assigned role.               |
| `POST`   | `/pid/namespaces`                                | Creates a new namespace. The creator is automatically assigned the **Manager** role.                     |
| `GET`    | `/pid/namespaces/{namespace_id}/resources`       | Lists all non-deleted PIDs within the specified namespace. Requires the `list` permission.               |
| `POST`   | `/pid/namespaces/{namespace_id}/resources`       | Creates a new PID within the specified namespace. Requires the `create` permission.                      |
| `GET`    | `/pid/namespaces/{namespace_id}/resources/{pid}` | Retrieves the details of a specific PID. This endpoint is publicly accessible.                           |
| `PATCH`  | `/pid/namespaces/{namespace_id}/resources/{pid}` | Updates the metadata of a PID. Requires the `update/delete` permission.                                  |
| `DELETE` | `/pid/namespaces/{namespace_id}/resources/{pid}` | Soft deletes a PID. Requires the `update/delete` permission.                                             |
| `GET`    | `/pid/namespaces/{namespace_id}/roles`          | Lists all users assigned to the namespace and their roles. Requires the `manage_permissions` permission. |
| `PUT`    | `/pid/namespaces/{namespace_id}/roles`          | Assigns or updates a user's role within the namespace. Requires the `manage_permissions` permission.     |
| `DELETE` | `/pid/namespaces/{namespace_id}/roles`          | Revokes a user's role within the namespace. Requires the `manage_permissions` permission.                |

### Authorization

Permissions are enforced based on the authenticated user's role within each namespace. Managers can administer roles for other users in their namespaces, while Django superusers have unrestricted access across all namespaces.


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
