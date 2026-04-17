let editId = null;

// 🔄 Load users when page loads
window.onload = loadUsers;

// ✅ CREATE or UPDATE USER
async function saveUser() {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const age = document.getElementById("age").value;

    const msg = document.getElementById("msg");

    // Validation
    if (!name || !email || !age) {
        msg.innerHTML = "<p class='error'>⚠️ Please fill all fields</p>";
        return;
    }

    try {
        const url = editId ? `/users/${editId}` : "/users/";
        const method = editId ? "PUT" : "POST";

        const res = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: name,
                email: email,
                age: Number(age)
            })
        });

        if (res.ok) {
            msg.innerHTML = `<p class='success'>✅ ${editId ? "Updated" : "Created"} Successfully!</p>`;

            clearForm();
            loadUsers(); // 🔄 refresh table
        } else {
            msg.innerHTML = "<p class='error'>❌ Operation failed</p>";
        }

    } catch (err) {
        msg.innerHTML = "<p class='error'>⚠️ Backend not reachable</p>";
        console.error(err);
    }
}

// 🔄 LOAD USERS
async function loadUsers() {
    try {
        const res = await fetch("/users/");
        const users = await res.json();

        const table = document.getElementById("userTable");
        table.innerHTML = "";

        users.forEach(user => {
            table.innerHTML += `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>${user.age}</td>
                    <td>
                        <button class="small" onclick="editUser(${user.id}, '${user.name}', '${user.email}', ${user.age})">Edit</button>
                        <button class="small" onclick="deleteUser(${user.id})">Delete</button>
                    </td>
                </tr>
            `;
        });

    } catch (err) {
        console.error("Error loading users:", err);
    }
}

// ❌ DELETE USER
async function deleteUser(id) {
    await fetch(`/users/${id}`, { method: "DELETE" });
    loadUsers();
}

// ✏️ EDIT USER
function editUser(id, name, email, age) {
    editId = id;

    document.getElementById("name").value = name;
    document.getElementById("email").value = email;
    document.getElementById("age").value = age;
}

// 🧹 CLEAR FORM
function clearForm() {
    editId = null;

    document.getElementById("name").value = "";
    document.getElementById("email").value = "";
    document.getElementById("age").value = "";
}
