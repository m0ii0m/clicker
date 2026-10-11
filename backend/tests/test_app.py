import pytest
import sys
import os

# Ajout du dossier parent au path pour importer app.py
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app


@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


def test_get_state_missing_header(client):
    """Vérifie que l'appel sans X-User-ID renvoie 400"""
    rv = client.get('/api/state')
    assert rv.status_code == 400
    assert b"User ID missing" in rv.data


def test_get_state_valid(client):
    """Vérifie que l'appel avec X-User-ID fonctionne"""
    rv = client.get('/api/state', headers={'X-User-ID': 'test_user'})
    assert rv.status_code == 200
    json_data = rv.get_json()
    assert "trombones" in json_data


def test_save_and_load(client):
    """Vérifie le cycle save/load"""
    save_data = {"trombones": 42, "production_rate": 3, "upgrades": {"zone": 2}}
    rv = client.post('/api/save',
                     json=save_data,
                     headers={'X-User-ID': 'test_cycle'})
    assert rv.status_code == 200

    rv = client.get('/api/state', headers={'X-User-ID': 'test_cycle'})
    json_data = rv.get_json()
    assert json_data["trombones"] == 42
    assert json_data["upgrades"]["zone"] == 2


def test_reset(client):
    """Vérifie que le reset renvoie l'état par défaut"""
    rv = client.delete('/api/reset', headers={'X-User-ID': 'test_reset'})
    assert rv.status_code == 200
    json_data = rv.get_json()
    assert json_data["trombones"] == 0


def test_offline_seconds(client):
    """Vérifie que le serveur renvoie le temps écoulé depuis la dernière sauvegarde"""
    client.post('/api/save', json={"trombones": 10}, headers={'X-User-ID': 'test_offline'})

    rv = client.get('/api/state', headers={'X-User-ID': 'test_offline'})
    json_data = rv.get_json()
    assert 0 <= json_data["offline_seconds"] < 5
    assert "last_saved" not in json_data


def test_save_invalid_body(client):
    """Vérifie qu'un état qui n'est pas un objet JSON est refusé"""
    rv = client.post('/api/save', json=[1, 2, 3], headers={'X-User-ID': 'test_invalid'})
    assert rv.status_code == 400
