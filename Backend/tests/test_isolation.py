def test_tenant_isolation(client, db):
    # 1. Register Recruiter A
    res_a = client.post(
        "/api/v1/auth/register/recruiter",
        json={
            "email": "a@test.com",
            "password": "password",
            "first_name": "A",
            "last_name": "A",
            "company_name": "Company A"
        }
    )
    assert res_a.status_code == 200

    token_a = client.post(
        "/api/v1/auth/login",
        json={"email": "a@test.com", "password": "password"}
    ).json()["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # 2. Register Recruiter B
    res_b = client.post(
        "/api/v1/auth/register/recruiter",
        json={
            "email": "b@test.com",
            "password": "password",
            "first_name": "B",
            "last_name": "B",
            "company_name": "Company B"
        }
    )
    assert res_b.status_code == 200

    token_b = client.post(
        "/api/v1/auth/login",
        json={"email": "b@test.com", "password": "password"}
    ).json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # 3. Recruiter A creates a job
    job_a_res = client.post(
        "/api/v1/recruiter/jobs/",
        json={"title": "Job A"},
        headers=headers_a
    )
    assert job_a_res.status_code == 200
    job_a_id = job_a_res.json()["id"]

    # 4. Recruiter B creates a job
    job_b_res = client.post(
        "/api/v1/recruiter/jobs/",
        json={"title": "Job B"},
        headers=headers_b
    )
    assert job_b_res.status_code == 200
    job_b_id = job_b_res.json()["id"]

    # 5. Isolation Check: Recruiter A lists jobs (should only see Job A)
    list_a = client.get("/api/v1/recruiter/jobs/", headers=headers_a)
    assert len(list_a.json()) == 1
    assert list_a.json()[0]["id"] == job_a_id

    # 6. Isolation Check: Recruiter A tries to fetch Job B explicitly
    fetch_b_as_a = client.get(f"/api/v1/recruiter/jobs/{job_b_id}", headers=headers_a)
    assert fetch_b_as_a.status_code == 404 # Should be 404 not found (tenant scoped)

def test_student_role_protection(client, student_token_headers):
    # Student tries to access recruiter jobs
    res = client.get("/api/v1/recruiter/jobs/", headers=student_token_headers)
    assert res.status_code == 403 # Forbidden
