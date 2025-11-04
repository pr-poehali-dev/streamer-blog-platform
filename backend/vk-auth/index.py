'''
Business: VK OAuth авторизация и управление сессиями пользователей
Args: event - dict с httpMethod, body, queryStringParameters
      context - объект с атрибутами request_id, function_name
Returns: HTTP ответ с токеном или информацией о пользователе
'''

import json
import os
import psycopg2
from typing import Dict, Any
from datetime import datetime, timedelta
import hashlib
import hmac

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        vk_user = body_data.get('vk_user')
        
        if not vk_user:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'VK user data required'}),
                'isBase64Encoded': False
            }
        
        dsn = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        vk_id = vk_user.get('id')
        first_name = vk_user.get('first_name', '')
        last_name = vk_user.get('last_name', '')
        photo_url = vk_user.get('photo_200', '')
        
        cur.execute(
            "INSERT INTO users (vk_id, first_name, last_name, photo_url) VALUES (%s, %s, %s, %s) "
            "ON CONFLICT (vk_id) DO UPDATE SET first_name = EXCLUDED.first_name, "
            "last_name = EXCLUDED.last_name, photo_url = EXCLUDED.photo_url RETURNING id",
            (vk_id, first_name, last_name, photo_url)
        )
        user_id = cur.fetchone()[0]
        conn.commit()
        
        token = hashlib.sha256(f"{vk_id}:{context.request_id}".encode()).hexdigest()
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'user_id': user_id,
                'vk_id': vk_id,
                'first_name': first_name,
                'last_name': last_name,
                'photo_url': photo_url,
                'token': token
            }),
            'isBase64Encoded': False
        }
    
    if method == 'GET':
        headers = event.get('headers', {})
        token = headers.get('X-User-Token') or headers.get('x-user-token')
        
        if not token:
            return {
                'statusCode': 401,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Token required'}),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'valid': True}),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 405,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }
