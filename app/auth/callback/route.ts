"use server";

import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
	const requestUrl = new URL(request.url)
	const code = requestUrl.searchParams.get('code')
	const token = requestUrl.searchParams.get('token')
	const type = requestUrl.searchParams.get('type')

	if (code) {
		const supabase = await createClient()
		const { data, error } = await supabase.auth.exchangeCodeForSession(code)

		if (error) {
			console.error('Auth error:', error)
			return NextResponse.redirect(`${requestUrl.origin}/login?error=${error.message}`)
		}

		if (data.session) {
			const response = NextResponse.redirect(`${requestUrl.origin}/complete-profile`)
			response.cookies.set('sb-auth-token', data.session.access_token, {
				path: '/',
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax',
				maxAge: 60 * 60 * 24 * 7 // 1週間
			})
			return response
		}
	} else if (token && type === 'signup') {
		const supabase = await createClient()
		const { data, error } = await supabase.auth.verifyOtp({
			token_hash: token,
			type: 'signup'
		})

		if (error) {
			console.error('OTP verification error:', error)
			return NextResponse.redirect(`${requestUrl.origin}/login?error=${error.message}`)
		}

		if (data.session) {
			const response = NextResponse.redirect(`${requestUrl.origin}/complete-profile`)
			response.cookies.set('sb-auth-token', data.session.access_token, {
				path: '/',
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax',
				maxAge: 60 * 60 * 24 * 7 // 1週間
			})
			return response
		}
	}

	// エラー時はログインページにリダイレクト
	return NextResponse.redirect(`${requestUrl.origin}/login?error=認証に失敗しました`)
}
