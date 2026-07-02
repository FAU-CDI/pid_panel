# QuickPID Django

## Overview

QuickPID Django is a web application built using Django that provides a user-friendly interface for interacting with the QuickPID Go backend. 
The Go service is responsible for creating and managing Persistent Identifiers (PIDs), while this Django application handles user authentication,
authorization, permission management, and exposes both a web interface and REST APIs for frontend integration.

## Features Implemented

### Authentication

* User login using Django authentication.
* User logout.
* Dashboard for authenticated users.
* Superusers have unrestricted access to all operations.

### Namespace Management

* List namespaces accessible to the logged-in user.
* Create new namespaces.
* Automatically grant the creator all permissions (Manager role) on newly created namespaces:

  * Create
  * Update/Delete
  * Mount
  * List


### PID Management

* Create PIDs within namespaces.
* List PIDs for namespaces where the user has List permission.
* Read PID details for a specific PID (public endpoint).
* Update PID metadata.
* Soft delete PIDs (internally marks PID delete flag as TRUE in the Go backend).
* Deleted PIDs are hidden from the user interface (410 HTTP Gone error).
  
## REST API

The project exposes a REST API for managing namespaces, PIDs, and namespace roles. All endpoints return JSON responses.
The Django backend acts as an API gateway between the frontend and the Go backend.

### Authentication

All endpoints require an authenticated user **except** retrieving an individual PID, which is publicly accessible.

### Endpoints

| Method   | Endpoint                                         | Description                                                                                                 |
|----------|--------------------------------------------------|-------------------------------------------------------------------------------------------------------------|
| `GET`    | `/pid/me`                                        | Returns information about the currently authenticated user.                                                 |
| `GET`    | `/pid/namespaces`                                | Lists all namespaces the authenticated user has access to, along with their assigned role.                  |
| `POST`   | `/pid/namespaces`                                | Creates a new namespace(by authenticated user). The creator is automatically assigned the **Manager** role. |
| `GET`    | `/pid/namespaces/{namespace_id}/resources`       | Lists all non-deleted PIDs within the specified namespace. Requires the `list` permission.                  |
| `POST`   | `/pid/namespaces/{namespace_id}/resources`       | Creates a new PID within the specified namespace. Requires the `create` permission.                         |
| `GET`    | `/pid/namespaces/{namespace_id}/resources/{pid}` | Retrieves the details of a specific PID. This endpoint is publicly accessible.                              |
| `PATCH`  | `/pid/namespaces/{namespace_id}/resources/{pid}` | Updates the metadata of a PID. Requires the `update/delete` permission.                                     |
| `DELETE` | `/pid/namespaces/{namespace_id}/resources/{pid}` | Soft deletes a PID. Requires the `update/delete` permission.                                                |
| `GET`    | `/pid/namespaces/{namespace_id}/roles`           | Lists all users assigned to the namespace and their roles. Requires the `manage_permissions` permission.    |
| `PUT`    | `/pid/namespaces/{namespace_id}/roles`           | Assigns or updates a user's role within the namespace. Requires the `manage_permissions` permission.        |
| `DELETE` | `/pid/namespaces/{namespace_id}/roles`           | Revokes a user's role within the namespace. Requires the `manage_permissions` permission.                   |

### Roles

Each user is assigned **one role per namespace**:

| Role            | Permissions                                   |
|-----------------|-----------------------------------------------|
| **Viewer**      | List namespaces and PIDs                      |
| **Contributor** | Viewer + Create PIDs                          |
| **Editor**      | Contributor + Update/Delete PIDs              |
| **Manager**     | Editor + Mount namespaces + Manage user roles |

A **Superuser** is not stored as a namespace role. Django superusers automatically have unrestricted access to all namespaces and administrative operations.

### Permission Storage
The database stores **roles only**, not individual permissions. The mapping from roles to permissions is defined in the application code.

### Namespace Creation
When a user creates a namespace, they are automatically assigned the **Manager** role for that namespace.

### Authorization
Access to API and UI operations is determined by checking whether the user's assigned role includes the required permission. Examples include:

* `list` – View namespaces and list PIDs.
* `create` – Create new PIDs.
* `update/delete` – Update or delete existing PIDs.
* `mount` – Perform namespace mount operations.
* `manage_permissions` – Assign, update, or revoke roles for other users within the namespace.

### Role Management

Managers and superusers can manage namespace access through the role management API.

Managers can:

* Assign roles to other users.
* Update roles for other users.
* Revoke roles from other users.

Managers **cannot** modify or revoke their own Manager role, preventing accidental loss of administrative access. Superusers are exempt from this restriction.

### Authorization

Permissions are enforced based on the authenticated user's role within each namespace. Managers can administer roles for other users in their namespaces, while Django superusers have unrestricted access across all namespaces.


## Technology Stack

* Python
* Django
* Django REST Framework
* SQLite
* [Poetry](https://python-poetry.org) for dependency management

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
